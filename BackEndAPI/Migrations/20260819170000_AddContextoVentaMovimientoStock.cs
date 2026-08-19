using BackEndAPI.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260819170000_AddContextoVentaMovimientoStock")]
    public partial class AddContextoVentaMovimientoStock : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdMesa",
                table: "MovimientosStock",
                type: "uuid",
                nullable: true);

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

            migrationBuilder.AddColumn<string>(
                name: "NombreMesa",
                table: "MovimientosStock",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NombreMozo",
                table: "MovimientosStock",
                type: "text",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE ""MovimientosStock"" AS movimiento
                SET ""IdMesa"" = visita.""IdMesa"",
                    ""NombreMesa"" = mesa.""Nombre"",
                    ""IdMozo"" = visita.""IdMozo"",
                    ""NombreMozo"" = NULLIF(BTRIM(CONCAT_WS(' ', mozo.""Nombres"", mozo.""Apellido"")), '')
                FROM ""Visitas"" AS visita
                LEFT JOIN ""Mesas"" AS mesa ON mesa.""Id"" = visita.""IdMesa""
                LEFT JOIN ""Personas"" AS mozo ON mozo.""Id"" = visita.""IdMozo""
                WHERE movimiento.""IdVisita"" = visita.""Id""
                  AND movimiento.""Canal"" = 1;

                UPDATE ""MovimientosStock"" AS movimiento
                SET ""NombreCliente"" = pedido.""NombreCliente""
                FROM ""DeliveriesTakeaways"" AS pedido
                WHERE movimiento.""IdVisita"" = pedido.""IdVisita""
                  AND movimiento.""Canal"" IN (2, 3);");

            migrationBuilder.AddCheckConstraint(
                name: "CK_MovimientosStock_ContextoCanal",
                table: "MovimientosStock",
                sql: "(\"Canal\" = 1 OR (\"IdMesa\" IS NULL AND \"NombreMesa\" IS NULL AND \"IdMozo\" IS NULL AND \"NombreMozo\" IS NULL)) " +
                     "AND (\"Canal\" IN (2, 3) OR \"NombreCliente\" IS NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosStock_IdMesa",
                table: "MovimientosStock",
                column: "IdMesa");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosStock_IdMozo",
                table: "MovimientosStock",
                column: "IdMozo");

            migrationBuilder.AddForeignKey(
                name: "FK_MovimientosStock_Mesas_IdMesa",
                table: "MovimientosStock",
                column: "IdMesa",
                principalTable: "Mesas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_MovimientosStock_Personas_IdMozo",
                table: "MovimientosStock",
                column: "IdMozo",
                principalTable: "Personas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_MovimientosStock_ContextoCanal",
                table: "MovimientosStock");

            migrationBuilder.DropForeignKey(
                name: "FK_MovimientosStock_Mesas_IdMesa",
                table: "MovimientosStock");

            migrationBuilder.DropForeignKey(
                name: "FK_MovimientosStock_Personas_IdMozo",
                table: "MovimientosStock");

            migrationBuilder.DropIndex(
                name: "IX_MovimientosStock_IdMesa",
                table: "MovimientosStock");

            migrationBuilder.DropIndex(
                name: "IX_MovimientosStock_IdMozo",
                table: "MovimientosStock");

            migrationBuilder.DropColumn(name: "IdMesa", table: "MovimientosStock");
            migrationBuilder.DropColumn(name: "IdMozo", table: "MovimientosStock");
            migrationBuilder.DropColumn(name: "NombreCliente", table: "MovimientosStock");
            migrationBuilder.DropColumn(name: "NombreMesa", table: "MovimientosStock");
            migrationBuilder.DropColumn(name: "NombreMozo", table: "MovimientosStock");
        }
    }
}
