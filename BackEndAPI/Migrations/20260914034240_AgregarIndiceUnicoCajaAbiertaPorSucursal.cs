using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class AgregarIndiceUnicoCajaAbiertaPorSucursal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "Facturado",
                table: "MovimientosCajas",
                type: "boolean",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.CreateIndex(
                name: "IX_Cajas_UnaAbiertaPorSucursal",
                table: "Cajas",
                column: "IdSucursal",
                unique: true,
                filter: "\"FechaCierre\" IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Cajas_UnaAbiertaPorSucursal",
                table: "Cajas");

            migrationBuilder.AlterColumn<bool>(
                name: "Facturado",
                table: "MovimientosCajas",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true);
        }
    }
}
