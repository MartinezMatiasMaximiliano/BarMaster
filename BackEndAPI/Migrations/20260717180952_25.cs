using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class _25 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Activa",
                table: "CuentasCorrientes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 3,
                column: "Nombre",
                value: "Pago Proveedor con Efectivo");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 4,
                column: "Nombre",
                value: "Pago Proveedor con Transferencia");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 5,
                column: "Nombre",
                value: "Pago Proveedor con Tarjeta De Credito/Debito");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 6,
                column: "Nombre",
                value: "Pago Sueldos con Efectivo");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 7,
                column: "Nombre",
                value: "Pago Sueldos con Transferencia");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 8,
                column: "Nombre",
                value: "Pago Sueldos con Tarjeta De Credito/Debito");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "EsEfectivo", "Nombre" },
                values: new object[] { true, "Gastos con Efectivo" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "EsEfectivo", "Nombre" },
                values: new object[] { false, "Gastos con Transferencia" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 11,
                column: "Nombre",
                value: "Gastos con Tarjeta De Credito/Debito");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "Entorno", "EsEfectivo", "EsIngreso", "Nombre" },
                values: new object[] { "CuentaCorriente", true, true, "Cobro con Efectivo" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "EsEfectivo", "Nombre" },
                values: new object[] { false, "Cobro con Transferencia" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 14,
                column: "Nombre",
                value: "Cobro con QR");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 15,
                column: "Nombre",
                value: "Cobro con Tarjeta De Credito/Debito");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 16,
                column: "Nombre",
                value: "Gastos");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 17,
                column: "Nombre",
                value: "Cobro con Efectivo");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 18,
                column: "Nombre",
                value: "Cobro con Tarjeta de Credito/Debito");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 19,
                column: "Nombre",
                value: "Cobro con Transferencia");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 20,
                columns: new[] { "EsEfectivo", "EsIngreso", "Nombre" },
                values: new object[] { false, true, "Cobro con QR" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 21,
                columns: new[] { "EsEfectivo", "Nombre" },
                values: new object[] { true, "Reembolso con Efectivo" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 22,
                column: "Nombre",
                value: "Reembolso Tarjeta de Credito/Debito");

            migrationBuilder.InsertData(
                table: "TipoMovimientosCajas",
                columns: new[] { "Id", "Entorno", "EsEfectivo", "EsIngreso", "Nombre" },
                values: new object[,]
                {
                    { 23, "Ventas", false, false, "Reembolso Transferencia" },
                    { 24, "Ventas", false, false, "Reembolso QR" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DropColumn(
                name: "Activa",
                table: "CuentasCorrientes");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 3,
                column: "Nombre",
                value: "Pago Proveedor Efectivo");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 4,
                column: "Nombre",
                value: "Pago Proveedor Transferencia");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 5,
                column: "Nombre",
                value: "Pago Proveedor Tarjeta De Credito/Debito");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 6,
                column: "Nombre",
                value: "Pago Sueldos Efectivo");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 7,
                column: "Nombre",
                value: "Pago Sueldos Transferencia");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 8,
                column: "Nombre",
                value: "Pago Sueldos Cuenta Corriente");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "EsEfectivo", "Nombre" },
                values: new object[] { false, "Pago Sueldos Tarjeta De Credito/Debito" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "EsEfectivo", "Nombre" },
                values: new object[] { true, "Gastos Efectivo" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 11,
                column: "Nombre",
                value: "Gastos Transferencia");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "Entorno", "EsEfectivo", "EsIngreso", "Nombre" },
                values: new object[] { "Movimiento", false, false, "Gastos Tarjeta de Credito/Debito" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "EsEfectivo", "Nombre" },
                values: new object[] { true, "Cobro Cuenta Corriente Efectivo" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 14,
                column: "Nombre",
                value: "Cobro Cuenta Corriente Transferencia");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 15,
                column: "Nombre",
                value: "Cobro Cuenta Corriente Tarjeta De Credito/Debito");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 16,
                column: "Nombre",
                value: "Gastos Cuenta Corriente");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 17,
                column: "Nombre",
                value: "Cobro Venta Efectivo");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 18,
                column: "Nombre",
                value: "Cobro Venta Tarjeta de Credito/Debito");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 19,
                column: "Nombre",
                value: "Cobro Venta Transferencia bancaria");

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 20,
                columns: new[] { "EsEfectivo", "EsIngreso", "Nombre" },
                values: new object[] { true, false, "Reembolso Efectivo" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 21,
                columns: new[] { "EsEfectivo", "Nombre" },
                values: new object[] { false, "Reembolso Tarjeta de Credito/Debito" });

            migrationBuilder.UpdateData(
                table: "TipoMovimientosCajas",
                keyColumn: "Id",
                keyValue: 22,
                column: "Nombre",
                value: "Reembolso Transferencia bancaria");
        }
    }
}
