using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyDistributedPrinting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "PrintRoutes" DROP CONSTRAINT "FK_PrintRoutes_ProductionAreas_ProductionAreaId";
                DROP INDEX "IX_PrintRoutes_IdSucursal_DocumentType";
                DROP INDEX "IX_PrintRoutes_IdSucursal_DocumentType_ProductionAreaId";
                DROP INDEX "IX_PrintRoutes_ProductionAreaId";
                ALTER TABLE "PrintRoutes" DROP CONSTRAINT "CK_PrintRoutes_MaxQueueAgeSeconds";

                ALTER TABLE "PrintRoutes" ADD "PrinterDeviceId" uuid NULL;
                ALTER TABLE "PrintRoutes" ADD "OutputType" character varying(24) NULL;
                ALTER TABLE "PrintRoutes" ADD "Trigger" character varying(32) NULL;

                WITH ranked_destinations AS (
                    SELECT d."PrintRouteId", d."PrinterDeviceId",
                           ROW_NUMBER() OVER (
                               PARTITION BY d."PrintRouteId"
                               ORDER BY CASE WHEN d."Mode" = 'Primary' THEN 0 ELSE 1 END, d."Order", d."Id"
                           ) AS rn
                    FROM "PrintRouteDestinations" d
                    WHERE d."Mode" <> 'Fallback'
                )
                UPDATE "PrintRoutes" r
                SET "PrinterDeviceId" = d."PrinterDeviceId",
                    "OutputType" = CASE WHEN r."DocumentType" = 'KitchenOrder' THEN 'KitchenOrder' ELSE 'Ticket' END,
                    "Trigger" = CASE
                        WHEN r."DocumentType" = 'KitchenOrder' THEN 'ProductsAddedToTable'
                        WHEN r."DocumentType" = 'Preticket' THEN 'PreticketGenerated'
                        ELSE 'BilledProductsPaid'
                    END
                FROM ranked_destinations d
                WHERE d."PrintRouteId" = r."Id" AND d.rn = 1;

                WITH ranked_destinations AS (
                    SELECT d."PrintRouteId", d."PrinterDeviceId",
                           ROW_NUMBER() OVER (
                               PARTITION BY d."PrintRouteId"
                               ORDER BY CASE WHEN d."Mode" = 'Primary' THEN 0 ELSE 1 END, d."Order", d."Id"
                           ) AS rn
                    FROM "PrintRouteDestinations" d
                    WHERE d."Mode" <> 'Fallback'
                )
                INSERT INTO "PrintRoutes" (
                    "Id", "IdSucursal", "DocumentType", "ProductionAreaId", "OfflinePolicy",
                    "MaxQueueAgeSeconds", "Enabled", "CreatedAt", "UpdatedAt",
                    "PrinterDeviceId", "OutputType", "Trigger")
                SELECT gen_random_uuid(), r."IdSucursal", r."DocumentType", r."ProductionAreaId", r."OfflinePolicy",
                       r."MaxQueueAgeSeconds", r."Enabled", r."CreatedAt", r."UpdatedAt",
                       d."PrinterDeviceId",
                       CASE WHEN r."DocumentType" = 'KitchenOrder' THEN 'KitchenOrder' ELSE 'Ticket' END,
                       CASE
                           WHEN r."DocumentType" = 'KitchenOrder' THEN 'ProductsAddedToTable'
                           WHEN r."DocumentType" = 'Preticket' THEN 'PreticketGenerated'
                           ELSE 'BilledProductsPaid'
                       END
                FROM "PrintRoutes" r
                JOIN ranked_destinations d ON d."PrintRouteId" = r."Id" AND d.rn > 1;

                DELETE FROM "PrintRoutes" WHERE "PrinterDeviceId" IS NULL;

                WITH duplicates AS (
                    SELECT "Id", ROW_NUMBER() OVER (
                        PARTITION BY "IdSucursal", "PrinterDeviceId", "OutputType", "Trigger"
                        ORDER BY "CreatedAt", "Id"
                    ) AS rn
                    FROM "PrintRoutes"
                )
                DELETE FROM "PrintRoutes" r USING duplicates d
                WHERE r."Id" = d."Id" AND d.rn > 1;

                DROP TABLE "PrinterAssignments";
                DROP TABLE "PrintJobAttempts";
                DROP TABLE "PrintRouteDestinations";
                DROP TABLE "ProductProductionAreaAssignments";

                ALTER TABLE "PrintRoutes" DROP COLUMN "DocumentType";
                ALTER TABLE "PrintRoutes" DROP COLUMN "ProductionAreaId";
                ALTER TABLE "PrintRoutes" DROP COLUMN "OfflinePolicy";
                ALTER TABLE "PrintRoutes" DROP COLUMN "MaxQueueAgeSeconds";
                ALTER TABLE "PrintRoutes" ALTER COLUMN "PrinterDeviceId" SET NOT NULL;
                ALTER TABLE "PrintRoutes" ALTER COLUMN "OutputType" SET NOT NULL;
                ALTER TABLE "PrintRoutes" ALTER COLUMN "Trigger" SET NOT NULL;

                DROP TABLE "ProductionAreas";

                CREATE INDEX "IX_PrintRoutes_PrinterDeviceId" ON "PrintRoutes" ("PrinterDeviceId");
                CREATE UNIQUE INDEX "IX_PrintRoutes_IdSucursal_PrinterDeviceId_OutputType_Trigger"
                    ON "PrintRoutes" ("IdSucursal", "PrinterDeviceId", "OutputType", "Trigger");
                ALTER TABLE "PrintRoutes" ADD CONSTRAINT "FK_PrintRoutes_PrinterDevices_PrinterDeviceId"
                    FOREIGN KEY ("PrinterDeviceId") REFERENCES "PrinterDevices" ("Id") ON DELETE RESTRICT;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "PrintRoutes"
                SET "Trigger" = CASE
                    WHEN "OutputType" = 'KitchenOrder' THEN 'KitchenOrder'
                    WHEN "Trigger" = 'PreticketGenerated' THEN 'Preticket'
                    ELSE 'PaymentReceipt'
                END;
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_PrintRoutes_PrinterDevices_PrinterDeviceId",
                table: "PrintRoutes");

            migrationBuilder.DropIndex(
                name: "IX_PrintRoutes_IdSucursal_PrinterDeviceId_OutputType_Trigger",
                table: "PrintRoutes");

            migrationBuilder.DropIndex(
                name: "IX_PrintRoutes_PrinterDeviceId",
                table: "PrintRoutes");

            migrationBuilder.DropColumn(
                name: "OutputType",
                table: "PrintRoutes");

            migrationBuilder.DropColumn(
                name: "PrinterDeviceId",
                table: "PrintRoutes");

            migrationBuilder.RenameColumn(
                name: "Trigger",
                table: "PrintRoutes",
                newName: "DocumentType");

            migrationBuilder.AddColumn<int>(
                name: "MaxQueueAgeSeconds",
                table: "PrintRoutes",
                type: "integer",
                nullable: false,
                defaultValue: 1800);

            migrationBuilder.AddColumn<string>(
                name: "OfflinePolicy",
                table: "PrintRoutes",
                type: "character varying(16)",
                maxLength: 16,
                nullable: false,
                defaultValue: "Queue");

            migrationBuilder.AddColumn<Guid>(
                name: "ProductionAreaId",
                table: "PrintRoutes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PrinterAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Copies = table.Column<short>(type: "smallint", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    Format = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    PaperWidthMm = table.Column<short>(type: "smallint", nullable: false),
                    QzPrinterName = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    Role = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrinterAssignments", x => x.Id);
                    table.CheckConstraint("CK_PrinterAssignments_Copies", "\"Copies\" BETWEEN 1 AND 10");
                    table.CheckConstraint("CK_PrinterAssignments_PaperWidthMm", "\"PaperWidthMm\" IN (58, 80)");
                    table.ForeignKey(
                        name: "FK_PrinterAssignments_PrintingStations_StationId",
                        column: x => x.StationId,
                        principalTable: "PrintingStations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PrintJobAttempts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PrintJobId = table.Column<Guid>(type: "uuid", nullable: false),
                    StationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ErrorCode = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    FinishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LeaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    Outcome = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    QzJobStatus = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TechnicalDetail = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrintJobAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrintJobAttempts_PrintJobs_PrintJobId",
                        column: x => x.PrintJobId,
                        principalTable: "PrintJobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PrintJobAttempts_PrintingStations_StationId",
                        column: x => x.StationId,
                        principalTable: "PrintingStations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrintRouteDestinations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PrinterDeviceId = table.Column<Guid>(type: "uuid", nullable: false),
                    PrintRouteId = table.Column<Guid>(type: "uuid", nullable: false),
                    Copies = table.Column<short>(type: "smallint", nullable: false),
                    Mode = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Order = table.Column<short>(type: "smallint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrintRouteDestinations", x => x.Id);
                    table.CheckConstraint("CK_PrintRouteDestinations_Copies", "\"Copies\" BETWEEN 1 AND 10");
                    table.CheckConstraint("CK_PrintRouteDestinations_Order", "\"Order\" >= 0");
                    table.ForeignKey(
                        name: "FK_PrintRouteDestinations_PrintRoutes_PrintRouteId",
                        column: x => x.PrintRouteId,
                        principalTable: "PrintRoutes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PrintRouteDestinations_PrinterDevices_PrinterDeviceId",
                        column: x => x.PrinterDeviceId,
                        principalTable: "PrinterDevices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductionAreas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    NameNormalized = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionAreas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductionAreas_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductProductionAreaAssignments",
                columns: table => new
                {
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductionAreaId = table.Column<Guid>(type: "uuid", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductProductionAreaAssignments", x => new { x.IdSucursal, x.ProductId });
                    table.ForeignKey(
                        name: "FK_ProductProductionAreaAssignments_ProductionAreas_Production~",
                        column: x => x.ProductionAreaId,
                        principalTable: "ProductionAreas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductProductionAreaAssignments_Productos_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductProductionAreaAssignments_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.Sql("""
                WITH duplicates AS (
                    SELECT "Id", ROW_NUMBER() OVER (
                        PARTITION BY "IdSucursal", "DocumentType"
                        ORDER BY "CreatedAt", "Id"
                    ) AS rn
                    FROM "PrintRoutes"
                )
                DELETE FROM "PrintRoutes" r USING duplicates d
                WHERE r."Id" = d."Id" AND d.rn > 1;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_PrintRoutes_IdSucursal_DocumentType",
                table: "PrintRoutes",
                columns: new[] { "IdSucursal", "DocumentType" },
                unique: true,
                filter: "\"ProductionAreaId\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PrintRoutes_IdSucursal_DocumentType_ProductionAreaId",
                table: "PrintRoutes",
                columns: new[] { "IdSucursal", "DocumentType", "ProductionAreaId" },
                unique: true,
                filter: "\"ProductionAreaId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PrintRoutes_ProductionAreaId",
                table: "PrintRoutes",
                column: "ProductionAreaId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_PrintRoutes_MaxQueueAgeSeconds",
                table: "PrintRoutes",
                sql: "\"MaxQueueAgeSeconds\" BETWEEN 30 AND 86400");

            migrationBuilder.CreateIndex(
                name: "IX_PrinterAssignments_StationId_Role",
                table: "PrinterAssignments",
                columns: new[] { "StationId", "Role" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobAttempts_PrintJobId_LeaseId",
                table: "PrintJobAttempts",
                columns: new[] { "PrintJobId", "LeaseId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobAttempts_StationId",
                table: "PrintJobAttempts",
                column: "StationId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintRouteDestinations_PrinterDeviceId",
                table: "PrintRouteDestinations",
                column: "PrinterDeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintRouteDestinations_PrintRouteId_PrinterDeviceId",
                table: "PrintRouteDestinations",
                columns: new[] { "PrintRouteId", "PrinterDeviceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductionAreas_IdSucursal",
                table: "ProductionAreas",
                column: "IdSucursal");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionAreas_IdSucursal_NameNormalized",
                table: "ProductionAreas",
                columns: new[] { "IdSucursal", "NameNormalized" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductProductionAreaAssignments_ProductId",
                table: "ProductProductionAreaAssignments",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductProductionAreaAssignments_ProductionAreaId",
                table: "ProductProductionAreaAssignments",
                column: "ProductionAreaId");

            migrationBuilder.AddForeignKey(
                name: "FK_PrintRoutes_ProductionAreas_ProductionAreaId",
                table: "PrintRoutes",
                column: "ProductionAreaId",
                principalTable: "ProductionAreas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

        }
    }
}
