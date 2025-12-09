using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class FKMesaSucursal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Mesas_Sucursales_IdSucursal",
                table: "Mesas");

            migrationBuilder.DropIndex(
                name: "IX_Mesas_IdSucursal",
                table: "Mesas");

            migrationBuilder.DropColumn(
                name: "IdSucursal",
                table: "Mesas");

            migrationBuilder.AddColumn<Guid>(
                name: "SucursalId",
                table: "Mesas",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Mesas_SucursalId",
                table: "Mesas",
                column: "SucursalId");

            migrationBuilder.AddForeignKey(
                name: "FK_Mesas_Sucursales_SucursalId",
                table: "Mesas",
                column: "SucursalId",
                principalTable: "Sucursales",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Mesas_Sucursales_SucursalId",
                table: "Mesas");

            migrationBuilder.DropIndex(
                name: "IX_Mesas_SucursalId",
                table: "Mesas");

            migrationBuilder.DropColumn(
                name: "SucursalId",
                table: "Mesas");

            migrationBuilder.AddColumn<Guid>(
                name: "IdSucursal",
                table: "Mesas",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Mesas_IdSucursal",
                table: "Mesas",
                column: "IdSucursal");

            migrationBuilder.AddForeignKey(
                name: "FK_Mesas_Sucursales_IdSucursal",
                table: "Mesas",
                column: "IdSucursal",
                principalTable: "Sucursales",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
