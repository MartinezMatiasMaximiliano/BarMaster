using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class fixIdPlano : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PosicionesMesas_Planos_IdMesa",
                table: "PosicionesMesas");

            migrationBuilder.CreateIndex(
                name: "IX_PosicionesMesas_IdPlano",
                table: "PosicionesMesas",
                column: "IdPlano");

            migrationBuilder.AddForeignKey(
                name: "FK_PosicionesMesas_Planos_IdPlano",
                table: "PosicionesMesas",
                column: "IdPlano",
                principalTable: "Planos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PosicionesMesas_Planos_IdPlano",
                table: "PosicionesMesas");

            migrationBuilder.DropIndex(
                name: "IX_PosicionesMesas_IdPlano",
                table: "PosicionesMesas");

            migrationBuilder.AddForeignKey(
                name: "FK_PosicionesMesas_Planos_IdMesa",
                table: "PosicionesMesas",
                column: "IdMesa",
                principalTable: "Planos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
