using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class SimplificarEstadosReserva : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Conservar las reservas y sus relaciones antes de retirar los estados anteriores.
            migrationBuilder.Sql("""
                UPDATE "Reservas" SET "IdEstadoReserva" = 2 WHERE "IdEstadoReserva" IN (1, 4);
                """);

            migrationBuilder.DeleteData(
                table: "EstadoReservas",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "EstadoReservas",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Reservas_EstadoPermitido",
                table: "Reservas",
                sql: "\"IdEstadoReserva\" IN (2, 3)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Restituye el catálogo; las reservas convertidas permanecen confirmadas.
            migrationBuilder.DropCheckConstraint(
                name: "CK_Reservas_EstadoPermitido",
                table: "Reservas");

            migrationBuilder.InsertData(
                table: "EstadoReservas",
                columns: new[] { "Id", "Nombre" },
                values: new object[,]
                {
                    { 1, "Pendiente" },
                    { 4, "Completada" }
                });
        }
    }
}
