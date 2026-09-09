using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class DesacoplarTrabajosDeImpresoras : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TrabajosImpresion_Impresoras_IdImpresora",
                table: "TrabajosImpresion");

            migrationBuilder.DropIndex(
                name: "IX_TrabajosImpresion_IdImpresora",
                table: "TrabajosImpresion");

            migrationBuilder.DropColumn(
                name: "IdImpresora",
                table: "TrabajosImpresion");

            migrationBuilder.AddColumn<string>(
                name: "NombreVisibleImpresora",
                table: "TrabajosImpresion",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NombreVisibleImpresora",
                table: "TrabajosImpresion");

            migrationBuilder.AddColumn<Guid>(
                name: "IdImpresora",
                table: "TrabajosImpresion",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_TrabajosImpresion_IdImpresora",
                table: "TrabajosImpresion",
                column: "IdImpresora");

            migrationBuilder.AddForeignKey(
                name: "FK_TrabajosImpresion_Impresoras_IdImpresora",
                table: "TrabajosImpresion",
                column: "IdImpresora",
                principalTable: "Impresoras",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
