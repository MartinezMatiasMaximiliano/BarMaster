using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class _3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Empresas_TipoSubscriptions_IdTipoSubscripcion",
                table: "Empresas");

            migrationBuilder.DropColumn(
                name: "IdProducto",
                table: "Categorias");

            migrationBuilder.AlterColumn<short>(
                name: "IdTipoSubscripcion",
                table: "Empresas",
                type: "smallint",
                nullable: true,
                oldClrType: typeof(short),
                oldType: "smallint");

            migrationBuilder.AddForeignKey(
                name: "FK_Empresas_TipoSubscriptions_IdTipoSubscripcion",
                table: "Empresas",
                column: "IdTipoSubscripcion",
                principalTable: "TipoSubscriptions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Empresas_TipoSubscriptions_IdTipoSubscripcion",
                table: "Empresas");

            migrationBuilder.AlterColumn<short>(
                name: "IdTipoSubscripcion",
                table: "Empresas",
                type: "smallint",
                nullable: false,
                defaultValue: (short)0,
                oldClrType: typeof(short),
                oldType: "smallint",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "IdProducto",
                table: "Categorias",
                type: "uuid",
                maxLength: 30,
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddForeignKey(
                name: "FK_Empresas_TipoSubscriptions_IdTipoSubscripcion",
                table: "Empresas",
                column: "IdTipoSubscripcion",
                principalTable: "TipoSubscriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
