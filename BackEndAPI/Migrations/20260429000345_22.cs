using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class _22 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductosPorVisita_Visitas_IdVisita",
                table: "ProductosPorVisita");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductosPorVisita_Visitas_IdVisita",
                table: "ProductosPorVisita",
                column: "IdVisita",
                principalTable: "Visitas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductosPorVisita_Visitas_IdVisita",
                table: "ProductosPorVisita");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductosPorVisita_Visitas_IdVisita",
                table: "ProductosPorVisita",
                column: "IdVisita",
                principalTable: "Visitas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
