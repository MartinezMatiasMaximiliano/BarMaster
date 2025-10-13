using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class PlanoNNMesas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PosicionesMesas");

            migrationBuilder.AddColumn<Guid>(
                name: "IdPlano",
                table: "Mesas",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<float>(
                name: "h",
                table: "Mesas",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "w",
                table: "Mesas",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "x",
                table: "Mesas",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "y",
                table: "Mesas",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.CreateIndex(
                name: "IX_Mesas_IdPlano",
                table: "Mesas",
                column: "IdPlano");

            migrationBuilder.AddForeignKey(
                name: "FK_Mesas_Planos_IdPlano",
                table: "Mesas",
                column: "IdPlano",
                principalTable: "Planos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Mesas_Planos_IdPlano",
                table: "Mesas");

            migrationBuilder.DropIndex(
                name: "IX_Mesas_IdPlano",
                table: "Mesas");

            migrationBuilder.DropColumn(
                name: "IdPlano",
                table: "Mesas");

            migrationBuilder.DropColumn(
                name: "h",
                table: "Mesas");

            migrationBuilder.DropColumn(
                name: "w",
                table: "Mesas");

            migrationBuilder.DropColumn(
                name: "x",
                table: "Mesas");

            migrationBuilder.DropColumn(
                name: "y",
                table: "Mesas");

            migrationBuilder.CreateTable(
                name: "PosicionesMesas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdMesa = table.Column<Guid>(type: "uuid", nullable: false),
                    IdPlano = table.Column<Guid>(type: "uuid", nullable: false),
                    h = table.Column<float>(type: "real", nullable: false),
                    w = table.Column<float>(type: "real", nullable: false),
                    x = table.Column<float>(type: "real", nullable: false),
                    y = table.Column<float>(type: "real", nullable: false)
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
                        name: "FK_PosicionesMesas_Planos_IdPlano",
                        column: x => x.IdPlano,
                        principalTable: "Planos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PosicionesMesas_IdMesa",
                table: "PosicionesMesas",
                column: "IdMesa");

            migrationBuilder.CreateIndex(
                name: "IX_PosicionesMesas_IdPlano",
                table: "PosicionesMesas",
                column: "IdPlano");
        }
    }
}
