using BackEndAPI.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260819180000_RemoveClienteEIdMozoMovimientoStock")]
    public partial class RemoveClienteEIdMozoMovimientoStock : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_MovimientosStock_ContextoCanal",
                table: "MovimientosStock");

            migrationBuilder.DropForeignKey(
                name: "FK_MovimientosStock_Personas_IdMozo",
                table: "MovimientosStock");

            migrationBuilder.DropIndex(
                name: "IX_MovimientosStock_IdMozo",
                table: "MovimientosStock");

            migrationBuilder.DropColumn(name: "IdMozo", table: "MovimientosStock");
            migrationBuilder.DropColumn(name: "NombreCliente", table: "MovimientosStock");

            migrationBuilder.AddCheckConstraint(
                name: "CK_MovimientosStock_ContextoCanal",
                table: "MovimientosStock",
                sql: "\"Canal\" = 1 OR (\"IdMesa\" IS NULL AND \"NombreMesa\" IS NULL AND \"NombreMozo\" IS NULL)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_MovimientosStock_ContextoCanal",
                table: "MovimientosStock");

            migrationBuilder.AddColumn<Guid>(
                name: "IdMozo",
                table: "MovimientosStock",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NombreCliente",
                table: "MovimientosStock",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosStock_IdMozo",
                table: "MovimientosStock",
                column: "IdMozo");

            migrationBuilder.AddForeignKey(
                name: "FK_MovimientosStock_Personas_IdMozo",
                table: "MovimientosStock",
                column: "IdMozo",
                principalTable: "Personas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddCheckConstraint(
                name: "CK_MovimientosStock_ContextoCanal",
                table: "MovimientosStock",
                sql: "(\"Canal\" = 1 OR (\"IdMesa\" IS NULL AND \"NombreMesa\" IS NULL AND \"IdMozo\" IS NULL AND \"NombreMozo\" IS NULL)) " +
                     "AND (\"Canal\" IN (2, 3) OR \"NombreCliente\" IS NULL)");
        }
    }
}
