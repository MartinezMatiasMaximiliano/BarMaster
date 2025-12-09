using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class posicionDeMesas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdMozo",
                table: "Visitas",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Planos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    nombre = table.Column<string>(type: "text", nullable: false),
                    detalles = table.Column<string>(type: "text", nullable: true),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Planos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Planos_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PosicionesMesas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdPlano = table.Column<Guid>(type: "uuid", nullable: false),
                    IdMesa = table.Column<Guid>(type: "uuid", nullable: false),
                    x = table.Column<float>(type: "real", nullable: false),
                    y = table.Column<float>(type: "real", nullable: false),
                    w = table.Column<float>(type: "real", nullable: false),
                    h = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PosicionesMesas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PosicionesMesas_Mesas_IdMesa",
                        column: x => x.IdMesa,
                        principalTable: "Mesas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PosicionesMesas_Planos_IdMesa",
                        column: x => x.IdMesa,
                        principalTable: "Planos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Visitas_IdMozo",
                table: "Visitas",
                column: "IdMozo");

            migrationBuilder.CreateIndex(
                name: "IX_Planos_IdSucursal",
                table: "Planos",
                column: "IdSucursal");

            migrationBuilder.CreateIndex(
                name: "IX_PosicionesMesas_IdMesa",
                table: "PosicionesMesas",
                column: "IdMesa");

            migrationBuilder.AddForeignKey(
                name: "FK_Visitas_Personas_IdMozo",
                table: "Visitas",
                column: "IdMozo",
                principalTable: "Personas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Visitas_Personas_IdMozo",
                table: "Visitas");

            migrationBuilder.DropTable(
                name: "PosicionesMesas");

            migrationBuilder.DropTable(
                name: "Planos");

            migrationBuilder.DropIndex(
                name: "IX_Visitas_IdMozo",
                table: "Visitas");

            migrationBuilder.DropColumn(
                name: "IdMozo",
                table: "Visitas");
        }
    }
}
