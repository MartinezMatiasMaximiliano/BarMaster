using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class productoNNvisita : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdProducto",
                table: "ProductosPorVisita",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductosPorVisita_IdProducto",
                table: "ProductosPorVisita",
                column: "IdProducto");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductosPorVisita_Productos_IdProducto",
                table: "ProductosPorVisita",
                column: "IdProducto",
                principalTable: "Productos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductosPorVisita_Productos_IdProducto",
                table: "ProductosPorVisita");

            migrationBuilder.DropIndex(
                name: "IX_ProductosPorVisita_IdProducto",
                table: "ProductosPorVisita");

            migrationBuilder.DropColumn(
                name: "IdProducto",
                table: "ProductosPorVisita");
        }
    }
}
