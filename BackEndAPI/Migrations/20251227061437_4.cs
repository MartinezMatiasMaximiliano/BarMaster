using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class _4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Personas_Roles_IdRol",
                table: "Personas");

            migrationBuilder.AddColumn<Guid>(
                name: "IdSucursal",
                table: "Personas",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Personas_IdSucursal",
                table: "Personas",
                column: "IdSucursal");

            migrationBuilder.AddForeignKey(
                name: "FK_Personas_Roles_IdRol",
                table: "Personas",
                column: "IdRol",
                principalTable: "Roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Personas_Sucursales_IdSucursal",
                table: "Personas",
                column: "IdSucursal",
                principalTable: "Sucursales",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Personas_Roles_IdRol",
                table: "Personas");

            migrationBuilder.DropForeignKey(
                name: "FK_Personas_Sucursales_IdSucursal",
                table: "Personas");

            migrationBuilder.DropIndex(
                name: "IX_Personas_IdSucursal",
                table: "Personas");

            migrationBuilder.DropColumn(
                name: "IdSucursal",
                table: "Personas");

            migrationBuilder.AddForeignKey(
                name: "FK_Personas_Roles_IdRol",
                table: "Personas",
                column: "IdRol",
                principalTable: "Roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
