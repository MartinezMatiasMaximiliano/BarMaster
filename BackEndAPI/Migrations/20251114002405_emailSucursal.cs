using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class emailSucursal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Password",
                table: "Sucursales",
                newName: "Username");

            migrationBuilder.AddColumn<string>(
                name: "Nombre",
                table: "Sucursales",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<byte[]>(
                name: "PasswordHash",
                table: "Sucursales",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "PasswordSalt",
                table: "Sucursales",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Nombre",
                table: "Sucursales");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "Sucursales");

            migrationBuilder.DropColumn(
                name: "PasswordSalt",
                table: "Sucursales");

            migrationBuilder.RenameColumn(
                name: "Username",
                table: "Sucursales",
                newName: "Password");
        }
    }
}
