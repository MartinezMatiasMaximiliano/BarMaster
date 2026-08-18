using BackEndAPI.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260818180000_AddCanalMovimientoStock")]
    public partial class AddCanalMovimientoStock : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Canal",
                table: "MovimientosStock",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddCheckConstraint(
                name: "CK_MovimientosStock_Canal",
                table: "MovimientosStock",
                sql: "\"Canal\" IN (0, 1, 2, 3)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_MovimientosStock_Canal",
                table: "MovimientosStock");

            migrationBuilder.DropColumn(
                name: "Canal",
                table: "MovimientosStock");
        }
    }
}
