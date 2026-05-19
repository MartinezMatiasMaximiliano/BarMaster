using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class _24 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_DeliveriesTakeaways_IdCadete",
                table: "DeliveriesTakeaways",
                column: "IdCadete");

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveriesTakeaways_Personas_IdCadete",
                table: "DeliveriesTakeaways",
                column: "IdCadete",
                principalTable: "Personas",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeliveriesTakeaways_Personas_IdCadete",
                table: "DeliveriesTakeaways");

            migrationBuilder.DropIndex(
                name: "IX_DeliveriesTakeaways_IdCadete",
                table: "DeliveriesTakeaways");
        }
    }
}
