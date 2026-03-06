using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class _15 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pagos_TipoPagos_IdTipoPago",
                table: "Pagos");

            migrationBuilder.DropTable(
                name: "TipoPagos");

            migrationBuilder.RenameColumn(
                name: "IdTipoPago",
                table: "Pagos",
                newName: "IdMovimientoCaja");

            migrationBuilder.RenameIndex(
                name: "IX_Pagos_IdTipoPago",
                table: "Pagos",
                newName: "IX_Pagos_IdMovimientoCaja");

            migrationBuilder.AddColumn<string>(
                name: "Entorno",
                table: "TipoMovimientosCajas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "IdMovimientoCaja",
                table: "ProductosPorVisita",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "IdVisita",
                table: "MovimientosCajas",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CuentasCorrientes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Telefono = table.Column<string>(type: "text", nullable: false),
                    Domicilo = table.Column<string>(type: "text", nullable: false),
                    Balance = table.Column<decimal>(type: "numeric", nullable: false),
                    Descuento = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CuentasCorrientes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MovimientosCuentaCorriente",
                columns: table => new
                {
                    IdCuentaCorriente = table.Column<Guid>(type: "uuid", nullable: false),
                    IdMovimientoCaja = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimientosCuentaCorriente", x => new { x.IdCuentaCorriente, x.IdMovimientoCaja });
                    table.ForeignKey(
                        name: "FK_MovimientosCuentaCorriente_CuentasCorrientes_IdCuentaCorrie~",
                        column: x => x.IdCuentaCorriente,
                        principalTable: "CuentasCorrientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MovimientosCuentaCorriente_MovimientosCajas_IdMovimientoCaja",
                        column: x => x.IdMovimientoCaja,
                        principalTable: "MovimientosCajas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Nombre" },
                values: new object[] { 3, "Cadete" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 1,
                column: "Entorno",
                value: "Movimiento");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 2,
                column: "Entorno",
                value: "Movimiento");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Entorno", "EsIngreso", "Nombre" },
                values: new object[] { "Movimiento", false, "Pago Proveedor Efectivo" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Entorno", "EsIngreso", "Nombre" },
                values: new object[] { "Movimiento", false, "Pago Proveedor Transferencia" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Entorno", "EsIngreso", "Nombre" },
                values: new object[] { "Movimiento", false, "Pago Proveedor Tarjeta De Credito/Debito" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Entorno", "Nombre" },
                values: new object[] { "Movimiento", "Pago Sueldos Efectivo" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Entorno", "Nombre" },
                values: new object[] { "Movimiento", "Pago Sueldos Transferencia" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Entorno", "Nombre" },
                values: new object[] { "Movimiento", "Pago Sueldos Cuenta Corriente" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Entorno", "EsEfectivo", "Nombre" },
                values: new object[] { "Movimiento", false, "Pago Sueldos Tarjeta De Credito/Debito" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "Entorno", "EsEfectivo", "Nombre" },
                values: new object[] { "Movimiento", true, "Gastos Efectivo" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "Entorno", "Nombre" },
                values: new object[] { "Movimiento", "Gastos Transferencia" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "Entorno", "Nombre" },
                values: new object[] { "Movimiento", "Gastos Tarjeta de Credito/Debito" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "Entorno", "EsIngreso", "Nombre" },
                values: new object[] { "CuentaCorriente", true, "Cobro Cuenta Corriente Efectivo" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "Entorno", "EsIngreso", "Nombre" },
                values: new object[] { "CuentaCorriente", true, "Cobro Cuenta Corriente Transferencia" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "Entorno", "EsIngreso", "Nombre" },
                values: new object[] { "CuentaCorriente", true, "Cobro Cuenta Corriente Tarjeta De Credito/Debito" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 16,
                column: "Entorno",
                value: "CuentaCorriente");

            migrationBuilder.InsertData(
                table: "TipoMovimientosCajas",
                columns: new[] { "Id", "Entorno", "EsEfectivo", "EsIngreso", "Nombre" },
                values: new object[,]
                {
                    { 17, "Ventas", true, true, "Cobro Venta Efectivo" },
                    { 18, "Ventas", false, true, "Cobro Venta Tarjeta de Credito/Debito" },
                    { 19, "Ventas", false, true, "Cobro Venta Transferencia bancaria" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCuentaCorriente_IdMovimientoCaja",
                table: "MovimientosCuentaCorriente",
                column: "IdMovimientoCaja");

            migrationBuilder.AddForeignKey(
                name: "FK_Pagos_TipoMovimientosCajas_IdMovimientoCaja",
                table: "Pagos",
                column: "IdMovimientoCaja",
                principalTable: "TipoMovimientosCajas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pagos_TipoMovimientosCajas_IdMovimientoCaja",
                table: "Pagos");

            migrationBuilder.DropTable(
                name: "MovimientosCuentaCorriente");

            migrationBuilder.DropTable(
                name: "CuentasCorrientes");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DropColumn(
                name: "Entorno",
                table: "TipoMovimientosCajas");

            migrationBuilder.DropColumn(
                name: "IdMovimientoCaja",
                table: "ProductosPorVisita");

            migrationBuilder.DropColumn(
                name: "IdVisita",
                table: "MovimientosCajas");

            migrationBuilder.RenameColumn(
                name: "IdMovimientoCaja",
                table: "Pagos",
                newName: "IdTipoPago");

            migrationBuilder.RenameIndex(
                name: "IX_Pagos_IdMovimientoCaja",
                table: "Pagos",
                newName: "IX_Pagos_IdTipoPago");

            migrationBuilder.CreateTable(
                name: "TipoPagos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoPagos", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "EsIngreso", "Nombre" },
                values: new object[] { true, "Cobro Cuenta Corriente Efectivo" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "EsIngreso", "Nombre" },
                values: new object[] { true, "Cobro Cuenta Corriente Transferencia" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "EsIngreso", "Nombre" },
                values: new object[] { true, "Cobro Cuenta Corriente Tarjeta De Credito/Debito" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 6,
                column: "Nombre",
                value: "Pago Proveedor Efectivo");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 7,
                column: "Nombre",
                value: "Pago Proveedor Transferencia");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 8,
                column: "Nombre",
                value: "Pago Proveedor Tarjeta De Credito/Debito");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "EsEfectivo", "Nombre" },
                values: new object[] { true, "Pago Sueldos Efectivo" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "EsEfectivo", "Nombre" },
                values: new object[] { false, "Pago Sueldos Transferencia" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 11,
                column: "Nombre",
                value: "Pago Sueldos Cuenta Corriente");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 12,
                column: "Nombre",
                value: "Pago Sueldos Tarjeta De Credito/Debito");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "EsIngreso", "Nombre" },
                values: new object[] { false, "Gastos Efectivo" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "EsIngreso", "Nombre" },
                values: new object[] { false, "Gastos Transferencia" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "EsIngreso", "Nombre" },
                values: new object[] { false, "Gastos Tarjeta de Credito/Debito" });

            migrationBuilder.InsertData(
                table: "TipoPagos",
                columns: new[] { "Id", "Nombre" },
                values: new object[,]
                {
                    { 1, "Efectivo" },
                    { 2, "Tarjeta de Crédito" },
                    { 3, "Tarjeta de Débito" },
                    { 4, "Transferencia Bancaria" }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_Pagos_TipoPagos_IdTipoPago",
                table: "Pagos",
                column: "IdTipoPago",
                principalTable: "TipoPagos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
