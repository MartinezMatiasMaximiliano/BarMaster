using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class _8 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TipoMovimientosCajas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    EsIngreso = table.Column<bool>(type: "boolean", nullable: false),
                    EsEfectivo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoMovimientosCajas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MovimientosCajas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdTipoMovimientoCaja = table.Column<int>(type: "integer", nullable: false),
                    IdCaja = table.Column<Guid>(type: "uuid", nullable: false),
                    Monto = table.Column<decimal>(type: "numeric", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: false),
                    FechaMovimiento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimientosCajas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovimientosCajas_Cajas_IdCaja",
                        column: x => x.IdCaja,
                        principalTable: "Cajas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MovimientosCajas_TipoMovimientosCajas_IdTipoMovimientoCaja",
                        column: x => x.IdTipoMovimientoCaja,
                        principalTable: "TipoMovimientosCajas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "TipoMovimientosCajas",
                columns: new[] { "Id", "Nombre", "EsEfectivo", "EsIngreso"},
                values: new object[,]
                {
                    { 1, "Ingreso de Efectivo", true, true },
                    { 2, "Retiro de Efectivo", true, false },
                    { 3, "Cobro Cuenta Corriente Efectivo", true, true },
                    { 4, "Cobro Cuenta Corriente Transferencia", false, true },
                    { 5, "Cobro Cuenta Corriente Tarjeta De Credito/Debito", false, true },
                    { 6, "Pago Proveedor Efectivo", true, false },
                    { 7, "Pago Proveedor Transferencia", false, false },
                    { 8, "Pago Proveedor Tarjeta De Credito/Debito", false, false },
                    { 9, "Pago Sueldos Efectivo", true, false },
                    { 10, "Pago Sueldos Transferencia", false, false },
                    { 11, "Pago Sueldos Cuenta Corriente", false, false },
                    { 12, "Pago Sueldos Tarjeta De Credito/Debito", false, false },
                    { 13, "Gastos Efectivo", true, false },
                    { 14, "Gastos Transferencia", false, false },
                    { 15, "Gastos Tarjeta de Credito/Debito", false, false },
                    { 16, "Gastos Cuenta Corriente", false, false }
                });

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCajas_IdCaja",
                table: "MovimientosCajas",
                column: "IdCaja");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCajas_IdTipoMovimientoCaja",
                table: "MovimientosCajas",
                column: "IdTipoMovimientoCaja");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MovimientosCajas");

            migrationBuilder.DropTable(
                name: "TipoMovimientosCajas");
        }
    }
}
