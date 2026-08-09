using BackEndAPI.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260809180000_AddPersonajeIdAPersonas")]
    public partial class AddPersonajeIdAPersonas : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PersonajeId",
                table: "Personas",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Personas_PersonajeId",
                table: "Personas",
                sql: "\"PersonajeId\" BETWEEN 0 AND 9");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Personas_PersonajeId",
                table: "Personas");

            migrationBuilder.DropColumn(
                name: "PersonajeId",
                table: "Personas");
        }
    }
}
