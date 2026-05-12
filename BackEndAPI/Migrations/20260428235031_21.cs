using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class _21 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeliveriesTakeaways_Visitas_IdVisita",
                table: "DeliveriesTakeaways");

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveriesTakeaways_Visitas_IdVisita",
                table: "DeliveriesTakeaways",
                column: "IdVisita",
                principalTable: "Visitas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeliveriesTakeaways_Visitas_IdVisita",
                table: "DeliveriesTakeaways");

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveriesTakeaways_Visitas_IdVisita",
                table: "DeliveriesTakeaways",
                column: "IdVisita",
                principalTable: "Visitas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
