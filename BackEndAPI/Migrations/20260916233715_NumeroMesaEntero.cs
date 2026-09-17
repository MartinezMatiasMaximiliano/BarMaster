using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class NumeroMesaEntero : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // EF ejecuta la validación, el renombrado y la conversión en una transacción.
            // Aceptar tanto "Mesa 01" como "1" sin modificar IDs ni relaciones.
            migrationBuilder.Sql("""
                LOCK TABLE "Mesas" IN ACCESS EXCLUSIVE MODE;
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM "Mesas"
                        WHERE "Nombre" IS NULL OR btrim("Nombre") !~* '^(Mesa[[:space:]]+)?[0-9]+$') THEN
                        RAISE EXCEPTION 'Hay mesas cuyo Nombre no es un número ni tiene el formato Mesa N. Corregir antes de migrar.';
                    END IF;
                    IF EXISTS (SELECT 1 FROM "Mesas"
                        WHERE regexp_replace(btrim("Nombre"), '^Mesa[[:space:]]+', '', 'i')::numeric
                            NOT BETWEEN 1 AND 2147483647) THEN
                        RAISE EXCEPTION 'Hay números de mesa fuera del rango de enteros positivos.';
                    END IF;
                    IF EXISTS (SELECT 1 FROM "Mesas" WHERE "IdPlano" IS NOT NULL
                        GROUP BY "IdPlano", regexp_replace(btrim("Nombre"), '^Mesa[[:space:]]+', '', 'i')::integer
                        HAVING count(*) > 1) THEN
                        RAISE EXCEPTION 'La conversión produce números de mesa duplicados dentro de un plano.';
                    END IF;
                END $$;
                ALTER TABLE "Mesas" RENAME COLUMN "Nombre" TO numero;
                ALTER TABLE "Mesas" ALTER COLUMN numero TYPE integer
                    USING regexp_replace(btrim(numero), '^Mesa[[:space:]]+', '', 'i')::integer;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "Mesas" ALTER COLUMN numero TYPE text USING 'Mesa ' || numero::text;
                ALTER TABLE "Mesas" RENAME COLUMN numero TO "Nombre";
                """);
        }
    }
}
