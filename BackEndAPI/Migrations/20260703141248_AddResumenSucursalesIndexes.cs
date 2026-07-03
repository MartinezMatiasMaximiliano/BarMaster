using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddResumenSucursalesIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Visitas_IdCaja",
                table: "Visitas");

            migrationBuilder.DropIndex(
                name: "IX_MovimientosCajas_IdCaja",
                table: "MovimientosCajas");

            migrationBuilder.DropIndex(
                name: "IX_Cajas_IdSucursal",
                table: "Cajas");

            migrationBuilder.CreateIndex(
                name: "IX_Visitas_IdCaja_FechaHora",
                table: "Visitas",
                columns: new[] { "IdCaja", "FechaHora" });

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCajas_IdCaja_FechaMovimiento",
                table: "MovimientosCajas",
                columns: new[] { "IdCaja", "FechaMovimiento" });

            migrationBuilder.CreateIndex(
                name: "IX_Cajas_IdSucursal_FechaCierre",
                table: "Cajas",
                columns: new[] { "IdSucursal", "FechaCierre" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Visitas_IdCaja_FechaHora",
                table: "Visitas");

            migrationBuilder.DropIndex(
                name: "IX_MovimientosCajas_IdCaja_FechaMovimiento",
                table: "MovimientosCajas");

            migrationBuilder.DropIndex(
                name: "IX_Cajas_IdSucursal_FechaCierre",
                table: "Cajas");

            migrationBuilder.CreateIndex(
                name: "IX_Visitas_IdCaja",
                table: "Visitas",
                column: "IdCaja");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCajas_IdCaja",
                table: "MovimientosCajas",
                column: "IdCaja");

            migrationBuilder.CreateIndex(
                name: "IX_Cajas_IdSucursal",
                table: "Cajas",
                column: "IdSucursal");
        }
    }
}
