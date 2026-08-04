using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class _26 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Precio",
                table: "Productos",
                newName: "PrecioNeto");

            migrationBuilder.AddColumn<decimal>(
                name: "IVADelMomento",
                table: "ProductosPorVisita",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PorcentajeIVA",
                table: "Productos",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "Facturado",
                table: "MovimientosCajas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "IdFactura",
                table: "MovimientosCajas",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "Cuit",
                table: "Empresas",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "ubicacionCert",
                table: "Empresas",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCajas_IdFactura",
                table: "MovimientosCajas",
                column: "IdFactura");

            migrationBuilder.AddForeignKey(
                name: "FK_MovimientosCajas_FacturasElectronicas_IdFactura",
                table: "MovimientosCajas",
                column: "IdFactura",
                principalTable: "FacturasElectronicas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MovimientosCajas_FacturasElectronicas_IdFactura",
                table: "MovimientosCajas");

            migrationBuilder.DropIndex(
                name: "IX_MovimientosCajas_IdFactura",
                table: "MovimientosCajas");

            migrationBuilder.DropColumn(
                name: "IVADelMomento",
                table: "ProductosPorVisita");

            migrationBuilder.DropColumn(
                name: "PorcentajeIVA",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "Facturado",
                table: "MovimientosCajas");

            migrationBuilder.DropColumn(
                name: "IdFactura",
                table: "MovimientosCajas");

            migrationBuilder.DropColumn(
                name: "Cuit",
                table: "Empresas");

            migrationBuilder.DropColumn(
                name: "ubicacionCert",
                table: "Empresas");

            migrationBuilder.RenameColumn(
                name: "PrecioNeto",
                table: "Productos",
                newName: "Precio");
        }
    }
}
