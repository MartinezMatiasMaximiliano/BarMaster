using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class _27 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Monto",
                table: "MovimientosCajas",
                newName: "Vuelto");

            migrationBuilder.AddColumn<decimal>(
                name: "MontoAbonado",
                table: "MovimientosCajas",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "MontoTotal",
                table: "MovimientosCajas",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrecioEnvio",
                table: "DeliveriesTakeaways",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "precioProductos",
                table: "DeliveriesTakeaways",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MontoAbonado",
                table: "MovimientosCajas");

            migrationBuilder.DropColumn(
                name: "MontoTotal",
                table: "MovimientosCajas");

            migrationBuilder.DropColumn(
                name: "PrecioEnvio",
                table: "DeliveriesTakeaways");

            migrationBuilder.DropColumn(
                name: "precioProductos",
                table: "DeliveriesTakeaways");

            migrationBuilder.RenameColumn(
                name: "Vuelto",
                table: "MovimientosCajas",
                newName: "Monto");
        }
    }
}
