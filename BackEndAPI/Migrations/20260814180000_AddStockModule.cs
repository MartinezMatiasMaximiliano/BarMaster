using System;
using BackEndAPI.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BackEndAPI.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260814180000_AddStockModule")]
    public partial class AddStockModule : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StockProductosSucursales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdProducto = table.Column<Guid>(type: "uuid", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    ControlaStock = table.Column<bool>(type: "boolean", nullable: false),
                    CantidadActual = table.Column<int>(type: "integer", nullable: false),
                    CantidadMinima = table.Column<int>(type: "integer", nullable: false),
                    FechaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockProductosSucursales", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockProductosSucursales_Productos_IdProducto",
                        column: x => x.IdProducto,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StockProductosSucursales_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MovimientosStock",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdStockProductoSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    Tipo = table.Column<string>(type: "text", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    StockAnterior = table.Column<int>(type: "integer", nullable: false),
                    StockPosterior = table.Column<int>(type: "integer", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Motivo = table.Column<string>(type: "text", nullable: true),
                    IdVisita = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimientosStock", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovimientosStock_StockProductosSucursales_IdStockProdu~",
                        column: x => x.IdStockProductoSucursal,
                        principalTable: "StockProductosSucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MovimientosStock_Visitas_IdVisita",
                        column: x => x.IdVisita,
                        principalTable: "Visitas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosStock_IdStockProductoSucursal",
                table: "MovimientosStock",
                column: "IdStockProductoSucursal");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosStock_IdVisita",
                table: "MovimientosStock",
                column: "IdVisita");

            migrationBuilder.CreateIndex(
                name: "IX_StockProductosSucursales_IdProducto_IdSucursal",
                table: "StockProductosSucursales",
                columns: new[] { "IdProducto", "IdSucursal" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockProductosSucursales_IdSucursal",
                table: "StockProductosSucursales",
                column: "IdSucursal");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "MovimientosStock");
            migrationBuilder.DropTable(name: "StockProductosSucursales");
        }
    }
}
