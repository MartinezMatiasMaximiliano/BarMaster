using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class _18 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Vehiculo",
                table: "TipoEnvios");

            migrationBuilder.AlterColumn<string>(
                name: "Telefono",
                table: "DeliveriesTakeaways",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.InsertData(
                table: "TipoMovimientosCajas",
                columns: new[] { "Id", "Entorno", "EsEfectivo", "EsIngreso", "Nombre" },
                values: new object[,]
                {
                    { 20, "Ventas", true, false, "Reembolso Efectivo" },
                    { 21, "Ventas", false, false, "Reembolso Tarjeta de Credito/Debito" },
                    { 22, "Ventas", false, false, "Reembolso Transferencia bancaria" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.AddColumn<string>(
                name: "Vehiculo",
                table: "TipoEnvios",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Telefono",
                table: "DeliveriesTakeaways",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
