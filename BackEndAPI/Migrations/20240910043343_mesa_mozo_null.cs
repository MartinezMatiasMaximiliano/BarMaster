using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class mesa_mozo_null : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Mesas_Mozos_MozoId",
                table: "Mesas");

            migrationBuilder.AlterColumn<int>(
                name: "MozoId",
                table: "Mesas",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Mesas_Mozos_MozoId",
                table: "Mesas",
                column: "MozoId",
                principalTable: "Mozos",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Mesas_Mozos_MozoId",
                table: "Mesas");

            migrationBuilder.AlterColumn<int>(
                name: "MozoId",
                table: "Mesas",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Mesas_Mozos_MozoId",
                table: "Mesas",
                column: "MozoId",
                principalTable: "Mozos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
