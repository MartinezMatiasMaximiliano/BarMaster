using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class personaMesa1n : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Mesas_Personas_PersonaId",
                table: "Mesas");

            migrationBuilder.DropIndex(
                name: "IX_Mesas_PersonaId",
                table: "Mesas");

            migrationBuilder.DropColumn(
                name: "PersonaId",
                table: "Mesas");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Mesas",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddForeignKey(
                name: "FK_Mesas_Personas_Id",
                table: "Mesas",
                column: "Id",
                principalTable: "Personas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Mesas_Personas_Id",
                table: "Mesas");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Mesas",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<int>(
                name: "PersonaId",
                table: "Mesas",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Mesas_PersonaId",
                table: "Mesas",
                column: "PersonaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Mesas_Personas_PersonaId",
                table: "Mesas",
                column: "PersonaId",
                principalTable: "Personas",
                principalColumn: "Id");
        }
    }
}
