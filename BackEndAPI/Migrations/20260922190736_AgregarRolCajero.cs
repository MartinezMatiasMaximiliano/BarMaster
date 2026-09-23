using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class AgregarRolCajero : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                INSERT INTO "Roles" ("Id", "Nombre")
                SELECT 4, 'Cajero'
                WHERE NOT EXISTS (
                    SELECT 1 FROM "Roles"
                    WHERE LOWER("Nombre") = LOWER('Cajero') OR "Id" = 4
                );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "DELETE FROM \"Roles\" WHERE \"Id\" = 4 AND LOWER(\"Nombre\") = LOWER('Cajero');");
        }
    }
}
