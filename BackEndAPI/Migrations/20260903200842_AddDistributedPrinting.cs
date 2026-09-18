using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDistributedPrinting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductosPorVisita_IdVisita",
                table: "ProductosPorVisita");

            migrationBuilder.AddColumn<Guid>(
                name: "AddCommandId",
                table: "ProductosPorVisita",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CredentialCreatedAt",
                table: "PrintingStations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CredentialHash",
                table: "PrintingStations",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastAgentVersion",
                table: "PrintingStations",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastQzVersion",
                table: "PrintingStations",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PrinterDevices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StationId = table.Column<Guid>(type: "uuid", nullable: false),
                    SystemPrinterName = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    SystemPrinterNameNormalized = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    DisplayName = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Format = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    PaperWidthMm = table.Column<short>(type: "smallint", nullable: false),
                    Encoding = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    IsPresent = table.Column<bool>(type: "boolean", nullable: false),
                    LastSeenAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastStatus = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrinterDevices", x => x.Id);
                    table.CheckConstraint("CK_PrinterDevices_PaperWidthMm", "\"PaperWidthMm\" IN (58, 80)");
                    table.ForeignKey(
                        name: "FK_PrinterDevices_PrintingStations_StationId",
                        column: x => x.StationId,
                        principalTable: "PrintingStations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductionAreas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    NameNormalized = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                name: "VisitOrderCommands",
                columns: table => new
                {
                    CommandId = table.Column<Guid>(type: "uuid", nullable: false),
                    VisitId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisitOrderCommands", x => x.CommandId);
                    table.ForeignKey(
                        name: "FK_VisitOrderCommands_Visitas_VisitId",
                        column: x => x.VisitId,
                        principalTable: "Visitas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PrintRoutes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentType = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    ProductionAreaId = table.Column<Guid>(type: "uuid", nullable: true),
                    OfflinePolicy = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    MaxQueueAgeSeconds = table.Column<int>(type: "integer", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrintRoutes", x => x.Id);
                    table.CheckConstraint("CK_PrintRoutes_MaxQueueAgeSeconds", "\"MaxQueueAgeSeconds\" BETWEEN 30 AND 86400");
                    table.ForeignKey(
                        name: "FK_PrintRoutes_ProductionAreas_ProductionAreaId",
                        column: x => x.ProductionAreaId,
                        principalTable: "ProductionAreas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrintRoutes_Sucursales_IdSucursal",
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

            migrationBuilder.CreateTable(
                name: "PrintJobs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    StationId = table.Column<Guid>(type: "uuid", nullable: false),
                    PrinterDeviceId = table.Column<Guid>(type: "uuid", nullable: false),
                    RouteId = table.Column<Guid>(type: "uuid", nullable: true),
                    RequestedByPersonaId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReprintOfJobId = table.Column<Guid>(type: "uuid", nullable: true),
                    DocumentType = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    SchemaVersion = table.Column<short>(type: "smallint", nullable: false),
                    TemplateVersion = table.Column<short>(type: "smallint", nullable: false),
                    PayloadJson = table.Column<string>(type: "jsonb", nullable: false),
                    SystemPrinterNameSnapshot = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    FormatSnapshot = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    PaperWidthMmSnapshot = table.Column<short>(type: "smallint", nullable: false),
                    EncodingSnapshot = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    CopiesSnapshot = table.Column<short>(type: "smallint", nullable: false),
                    Status = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    IdempotencyKey = table.Column<string>(type: "character varying(220)", maxLength: 220, nullable: false),
                    SourceEntityType = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SourceEntityId = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AvailableAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LeaseId = table.Column<Guid>(type: "uuid", nullable: true),
                    LeaseExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DispatchStartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SpoolAcceptedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AttemptCount = table.Column<short>(type: "smallint", nullable: false),
                    LastErrorCode = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    LastErrorDetail = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrintJobs", x => x.Id);
                    table.CheckConstraint("CK_PrintJobs_AttemptCount", "\"AttemptCount\" >= 0");
                    table.CheckConstraint("CK_PrintJobs_CopiesSnapshot", "\"CopiesSnapshot\" BETWEEN 1 AND 10");
                    table.CheckConstraint("CK_PrintJobs_Expiry", "\"ExpiresAt\" > \"CreatedAt\"");
                    table.CheckConstraint("CK_PrintJobs_PaperWidthMmSnapshot", "\"PaperWidthMmSnapshot\" IN (58, 80)");
                    table.CheckConstraint("CK_PrintJobs_Versions", "\"SchemaVersion\" > 0 AND \"TemplateVersion\" > 0");
                    table.ForeignKey(
                        name: "FK_PrintJobs_PrintJobs_ReprintOfJobId",
                        column: x => x.ReprintOfJobId,
                        principalTable: "PrintJobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrintJobs_PrintRoutes_RouteId",
                        column: x => x.RouteId,
                        principalTable: "PrintRoutes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PrintJobs_PrinterDevices_PrinterDeviceId",
                        column: x => x.PrinterDeviceId,
                        principalTable: "PrinterDevices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrintJobs_PrintingStations_StationId",
                        column: x => x.StationId,
                        principalTable: "PrintingStations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrintJobs_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrintRouteDestinations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PrintRouteId = table.Column<Guid>(type: "uuid", nullable: false),
                    PrinterDeviceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Copies = table.Column<short>(type: "smallint", nullable: false),
                    Order = table.Column<short>(type: "smallint", nullable: false),
                    Mode = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false)
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
                name: "PrintJobAttempts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PrintJobId = table.Column<Guid>(type: "uuid", nullable: false),
                    StationId = table.Column<Guid>(type: "uuid", nullable: false),
                    LeaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FinishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Outcome = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    ErrorCode = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    TechnicalDetail = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    QzJobStatus = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true)
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

            migrationBuilder.CreateIndex(
                name: "IX_ProductosPorVisita_IdVisita_AddCommandId",
                table: "ProductosPorVisita",
                columns: new[] { "IdVisita", "AddCommandId" });

            migrationBuilder.CreateIndex(
                name: "IX_PrinterDevices_StationId",
                table: "PrinterDevices",
                column: "StationId");

            migrationBuilder.CreateIndex(
                name: "IX_PrinterDevices_StationId_SystemPrinterNameNormalized",
                table: "PrinterDevices",
                columns: new[] { "StationId", "SystemPrinterNameNormalized" },
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
                name: "IX_PrintJobs_IdSucursal_IdempotencyKey",
                table: "PrintJobs",
                columns: new[] { "IdSucursal", "IdempotencyKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_IdSucursal_RequestId",
                table: "PrintJobs",
                columns: new[] { "IdSucursal", "RequestId" });

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_PrinterDeviceId",
                table: "PrintJobs",
                column: "PrinterDeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_ReprintOfJobId",
                table: "PrintJobs",
                column: "ReprintOfJobId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_RouteId",
                table: "PrintJobs",
                column: "RouteId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_StationId",
                table: "PrintJobs",
                column: "StationId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_StationId_Status_AvailableAt_CreatedAt",
                table: "PrintJobs",
                columns: new[] { "StationId", "Status", "AvailableAt", "CreatedAt" },
                filter: "\"Status\" IN ('Pending', 'RetryScheduled')");

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_Status_LeaseExpiresAt",
                table: "PrintJobs",
                columns: new[] { "Status", "LeaseExpiresAt" },
                filter: "\"Status\" IN ('Leased', 'Dispatching')");

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
                name: "IX_PrintRoutes_IdSucursal",
                table: "PrintRoutes",
                column: "IdSucursal");

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

            migrationBuilder.CreateIndex(
                name: "IX_VisitOrderCommands_VisitId",
                table: "VisitOrderCommands",
                column: "VisitId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PrintJobAttempts");

            migrationBuilder.DropTable(
                name: "PrintRouteDestinations");

            migrationBuilder.DropTable(
                name: "ProductProductionAreaAssignments");

            migrationBuilder.DropTable(
                name: "VisitOrderCommands");

            migrationBuilder.DropTable(
                name: "PrintJobs");

            migrationBuilder.DropTable(
                name: "PrintRoutes");

            migrationBuilder.DropTable(
                name: "PrinterDevices");

            migrationBuilder.DropTable(
                name: "ProductionAreas");

            migrationBuilder.DropIndex(
                name: "IX_ProductosPorVisita_IdVisita_AddCommandId",
                table: "ProductosPorVisita");

            migrationBuilder.DropColumn(
                name: "AddCommandId",
                table: "ProductosPorVisita");

            migrationBuilder.DropColumn(
                name: "CredentialCreatedAt",
                table: "PrintingStations");

            migrationBuilder.DropColumn(
                name: "CredentialHash",
                table: "PrintingStations");

            migrationBuilder.DropColumn(
                name: "LastAgentVersion",
                table: "PrintingStations");

            migrationBuilder.DropColumn(
                name: "LastQzVersion",
                table: "PrintingStations");

            migrationBuilder.CreateIndex(
                name: "IX_ProductosPorVisita_IdVisita",
                table: "ProductosPorVisita",
                column: "IdVisita");
        }
    }
}
