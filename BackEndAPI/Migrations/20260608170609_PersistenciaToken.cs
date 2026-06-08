using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class PersistenciaToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FacturasElectronicas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PuntoVenta = table.Column<int>(type: "integer", nullable: false),
                    TipoComprobante = table.Column<int>(type: "integer", nullable: false),
                    NumeroComprobante = table.Column<long>(type: "bigint", nullable: false),
                    CAE = table.Column<string>(type: "text", nullable: false),
                    CAEFechaEmision = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CAEFechaVencimiento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Total = table.Column<decimal>(type: "numeric", nullable: false),
                    JsonSolicitud = table.Column<string>(type: "text", nullable: false),
                    XmlRespuesta = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FacturasElectronicas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FETokenAuths",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Token = table.Column<string>(type: "text", nullable: false),
                    Sign = table.Column<string>(type: "text", nullable: false),
                    ExpirationTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FETokenAuths", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FacturasElectronicas");

            migrationBuilder.DropTable(
                name: "FETokenAuths");
        }
    }
}
