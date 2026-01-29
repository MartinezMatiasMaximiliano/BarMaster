using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class _10 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cantidad",
                table: "ProductosPorVisita");

            migrationBuilder.DropColumn(
                name: "PrecioTotal",
                table: "ProductosPorVisita");

            migrationBuilder.AddColumn<bool>(
                name: "EstadoPagado",
                table: "ProductosPorVisita",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EstadoPagado",
                table: "ProductosPorVisita");

            migrationBuilder.AddColumn<int>(
                name: "Cantidad",
                table: "ProductosPorVisita",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "PrecioTotal",
                table: "ProductosPorVisita",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
