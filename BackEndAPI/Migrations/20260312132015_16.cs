using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class _16 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Pagos");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCajas_IdVisita",
                table: "MovimientosCajas",
                column: "IdVisita");

            migrationBuilder.AddForeignKey(
                name: "FK_MovimientosCajas_Visitas_IdVisita",
                table: "MovimientosCajas",
                column: "IdVisita",
                principalTable: "Visitas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MovimientosCajas_Visitas_IdVisita",
                table: "MovimientosCajas");

            migrationBuilder.DropIndex(
                name: "IX_MovimientosCajas_IdVisita",
                table: "MovimientosCajas");

            migrationBuilder.CreateTable(
                name: "Pagos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdMovimientoCaja = table.Column<int>(type: "integer", nullable: false),
                    IdVisita = table.Column<Guid>(type: "uuid", nullable: false),
                    FechaHora = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Monto = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pagos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pagos_TipoMovimientosCajas_IdMovimientoCaja",
                        column: x => x.IdMovimientoCaja,
                        principalTable: "TipoMovimientosCajas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Pagos_Visitas_IdVisita",
                        column: x => x.IdVisita,
                        principalTable: "Visitas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_IdMovimientoCaja",
                table: "Pagos",
                column: "IdMovimientoCaja");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_IdVisita",
                table: "Pagos",
                column: "IdVisita");
        }
    }
}
