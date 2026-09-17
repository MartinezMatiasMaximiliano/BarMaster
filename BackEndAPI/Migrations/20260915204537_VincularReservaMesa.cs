using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class VincularReservaMesa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservas_IdSucursal",
                table: "Reservas");

            migrationBuilder.AddColumn<Guid>(
                name: "IdMesa",
                table: "Reservas",
                type: "uuid",
                nullable: true);

            // No descartar nombres históricos que no se puedan resolver sin ambigüedad.
            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM "Reservas" r
                        WHERE btrim(r."MesaReserva") <> '' AND (
                            SELECT count(*) FROM "Mesas" m
                            JOIN "Planos" p ON p."Id" = m."IdPlano"
                            WHERE p."IdSucursal" = r."IdSucursal"
                              AND lower(btrim(m."Nombre")) = lower(btrim(r."MesaReserva"))
                        ) <> 1
                    ) THEN
                        RAISE EXCEPTION 'Hay reservas con nombres de mesa inexistentes o ambiguos. Corregir MesaReserva antes de migrar.';
                    END IF;
                END $$;
                UPDATE "Reservas" r SET "IdMesa" = m."Id"
                FROM "Mesas" m JOIN "Planos" p ON p."Id" = m."IdPlano"
                WHERE p."IdSucursal" = r."IdSucursal"
                  AND btrim(r."MesaReserva") <> ''
                  AND lower(btrim(m."Nombre")) = lower(btrim(r."MesaReserva"));
                """);

            migrationBuilder.DropColumn(name: "MesaReserva", table: "Reservas");

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_IdMesa",
                table: "Reservas",
                column: "IdMesa");

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_IdSucursal_FechaHora",
                table: "Reservas",
                columns: new[] { "IdSucursal", "FechaHora" });

            migrationBuilder.AddForeignKey(
                name: "FK_Reservas_Mesas_IdMesa",
                table: "Reservas",
                column: "IdMesa",
                principalTable: "Mesas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservas_Mesas_IdMesa",
                table: "Reservas");

            migrationBuilder.DropIndex(
                name: "IX_Reservas_IdMesa",
                table: "Reservas");

            migrationBuilder.DropIndex(
                name: "IX_Reservas_IdSucursal_FechaHora",
                table: "Reservas");

            migrationBuilder.AddColumn<string>(
                name: "MesaReserva",
                table: "Reservas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql("""
                UPDATE "Reservas" r SET "MesaReserva" = m."Nombre"
                FROM "Mesas" m WHERE m."Id" = r."IdMesa";
                """);
            migrationBuilder.DropColumn(name: "IdMesa", table: "Reservas");

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_IdSucursal",
                table: "Reservas",
                column: "IdSucursal");
        }
    }
}
