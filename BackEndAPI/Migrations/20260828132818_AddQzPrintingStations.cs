using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddQzPrintingStations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PrintingStations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientInstallationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastSeenAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RevokedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrintingStations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrintingStations_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrinterAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    QzPrinterName = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    Format = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    PaperWidthMm = table.Column<short>(type: "smallint", nullable: false),
                    Copies = table.Column<short>(type: "smallint", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
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

            migrationBuilder.CreateIndex(
                name: "IX_PrinterAssignments_StationId_Role",
                table: "PrinterAssignments",
                columns: new[] { "StationId", "Role" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PrintingStations_IdSucursal_ClientInstallationId",
                table: "PrintingStations",
                columns: new[] { "IdSucursal", "ClientInstallationId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PrinterAssignments");

            migrationBuilder.DropTable(
                name: "PrintingStations");
        }
    }
}
