using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class _12 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Deliveries");

            migrationBuilder.AlterColumn<Guid>(
                name: "IdMesa",
                table: "Visitas",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<string>(
                name: "Origen",
                table: "Visitas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaAgregado",
                table: "ProductosPorVisita",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "DeliveriesTakeaways",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    IdTipoEnvio = table.Column<int>(type: "integer", nullable: true),
                    IdVisita = table.Column<Guid>(type: "uuid", nullable: false),
                    FechaHora = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NombreCliente = table.Column<string>(type: "text", nullable: false),
                    Direccion = table.Column<string>(type: "text", nullable: false),
                    Indicaciones = table.Column<string>(type: "text", nullable: true),
                    Telefono = table.Column<string>(type: "text", nullable: false),
                    PrecioTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    Entregado = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveriesTakeaways", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeliveriesTakeaways_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_DeliveriesTakeaways_TipoEnvios_IdTipoEnvio",
                        column: x => x.IdTipoEnvio,
                        principalTable: "TipoEnvios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_DeliveriesTakeaways_Visitas_IdVisita",
                        column: x => x.IdVisita,
                        principalTable: "Visitas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DeliveriesTakeaways_IdSucursal",
                table: "DeliveriesTakeaways",
                column: "IdSucursal");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveriesTakeaways_IdTipoEnvio",
                table: "DeliveriesTakeaways",
                column: "IdTipoEnvio");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveriesTakeaways_IdVisita",
                table: "DeliveriesTakeaways",
                column: "IdVisita");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DeliveriesTakeaways");

            migrationBuilder.DropColumn(
                name: "Origen",
                table: "Visitas");

            migrationBuilder.DropColumn(
                name: "FechaAgregado",
                table: "ProductosPorVisita");

            migrationBuilder.AlterColumn<Guid>(
                name: "IdMesa",
                table: "Visitas",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "Deliveries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    IdTipoEnvio = table.Column<int>(type: "integer", nullable: false),
                    IdVisita = table.Column<Guid>(type: "uuid", nullable: false),
                    Direccion = table.Column<string>(type: "text", nullable: false),
                    Entregado = table.Column<bool>(type: "boolean", nullable: false),
                    FechaHora = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Indicaciones = table.Column<string>(type: "text", nullable: true),
                    NombreCliente = table.Column<string>(type: "text", nullable: false),
                    PrecioTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    Telefono = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deliveries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Deliveries_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Deliveries_TipoEnvios_IdTipoEnvio",
                        column: x => x.IdTipoEnvio,
                        principalTable: "TipoEnvios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Deliveries_Visitas_IdVisita",
                        column: x => x.IdVisita,
                        principalTable: "Visitas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_IdSucursal",
                table: "Deliveries",
                column: "IdSucursal");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_IdTipoEnvio",
                table: "Deliveries",
                column: "IdTipoEnvio");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_IdVisita",
                table: "Deliveries",
                column: "IdVisita");
        }
    }
}
