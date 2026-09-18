using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class ReservaConfirmadaUnicaPorMesaYMinuto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Reservas_IdSucursal_IdMesa_FechaHora",
                table: "Reservas",
                columns: new[] { "IdSucursal", "IdMesa", "FechaHora" },
                unique: true,
                filter: "\"IdEstadoReserva\" = 2 AND \"IdMesa\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservas_IdSucursal_IdMesa_FechaHora",
                table: "Reservas");
        }
    }
}
