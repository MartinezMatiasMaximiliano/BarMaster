using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class EspanolizarModuloImpresion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PrintJobs");

            migrationBuilder.DropTable(
                name: "VisitOrderCommands");

            migrationBuilder.DropTable(
                name: "PrintRoutes");

            migrationBuilder.DropTable(
                name: "PrinterDevices");

            migrationBuilder.DropTable(
                name: "PrintingStations");

            migrationBuilder.RenameColumn(
                name: "AddCommandId",
                table: "ProductosPorVisita",
                newName: "IdComandoAgregado");

            migrationBuilder.RenameIndex(
                name: "IX_ProductosPorVisita_IdVisita_AddCommandId",
                table: "ProductosPorVisita",
                newName: "IX_ProductosPorVisita_IdVisita_IdComandoAgregado");

            migrationBuilder.CreateTable(
                name: "ComandosPedidoVisita",
                columns: table => new
                {
                    IdComando = table.Column<Guid>(type: "uuid", nullable: false),
                    IdVisita = table.Column<Guid>(type: "uuid", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComandosPedidoVisita", x => x.IdComando);
                    table.ForeignKey(
                        name: "FK_ComandosPedidoVisita_Visitas_IdVisita",
                        column: x => x.IdVisita,
                        principalTable: "Visitas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EstacionesImpresion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    IdInstalacionCliente = table.Column<Guid>(type: "uuid", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Habilitada = table.Column<bool>(type: "boolean", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    VistaPorUltimaVezEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RevocadaEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HashCredencial = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    CredencialCreadaEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UltimaVersionAgente = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    UltimaVersionQz = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstacionesImpresion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EstacionesImpresion_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Impresoras",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdEstacion = table.Column<Guid>(type: "uuid", nullable: false),
                    NombreSistema = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    NombreSistemaNormalizado = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    NombreVisible = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Formato = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    AnchoPapelMm = table.Column<short>(type: "smallint", nullable: false),
                    Codificacion = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Habilitada = table.Column<bool>(type: "boolean", nullable: false),
                    Presente = table.Column<bool>(type: "boolean", nullable: false),
                    VistaPorUltimaVezEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UltimoEstado = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    ActualizadoEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Impresoras", x => x.Id);
                    table.CheckConstraint("CK_Impresoras_AnchoPapelMm", "\"AnchoPapelMm\" IN (58, 80)");
                    table.ForeignKey(
                        name: "FK_Impresoras_EstacionesImpresion_IdEstacion",
                        column: x => x.IdEstacion,
                        principalTable: "EstacionesImpresion",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReglasImpresion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    IdImpresora = table.Column<Guid>(type: "uuid", nullable: false),
                    TipoSalida = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    Momento = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Habilitada = table.Column<bool>(type: "boolean", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ActualizadoEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReglasImpresion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReglasImpresion_Impresoras_IdImpresora",
                        column: x => x.IdImpresora,
                        principalTable: "Impresoras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReglasImpresion_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TrabajosImpresion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdSolicitud = table.Column<Guid>(type: "uuid", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    IdEstacion = table.Column<Guid>(type: "uuid", nullable: false),
                    IdImpresora = table.Column<Guid>(type: "uuid", nullable: false),
                    IdRegla = table.Column<Guid>(type: "uuid", nullable: true),
                    IdPersonaSolicitante = table.Column<Guid>(type: "uuid", nullable: true),
                    IdTrabajoReimpreso = table.Column<Guid>(type: "uuid", nullable: true),
                    TipoDocumento = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    VersionEsquema = table.Column<short>(type: "smallint", nullable: false),
                    VersionPlantilla = table.Column<short>(type: "smallint", nullable: false),
                    ContenidoJson = table.Column<string>(type: "jsonb", nullable: false),
                    NombreSistemaImpresora = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    Formato = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    AnchoPapelMm = table.Column<short>(type: "smallint", nullable: false),
                    Codificacion = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Copias = table.Column<short>(type: "smallint", nullable: false),
                    Estado = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    ClaveIdempotencia = table.Column<string>(type: "character varying(220)", maxLength: 220, nullable: false),
                    TipoEntidadOrigen = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    IdEntidadOrigen = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DisponibleEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    VenceEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IdReserva = table.Column<Guid>(type: "uuid", nullable: true),
                    ReservaVenceEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EnvioIniciadoEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AceptadoPorColaEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CantidadIntentos = table.Column<short>(type: "smallint", nullable: false),
                    UltimoCodigoError = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    UltimoDetalleError = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrabajosImpresion", x => x.Id);
                    table.CheckConstraint("CK_TrabajosImpresion_AnchoPapelMm", "\"AnchoPapelMm\" IN (58, 80)");
                    table.CheckConstraint("CK_TrabajosImpresion_CantidadIntentos", "\"CantidadIntentos\" >= 0");
                    table.CheckConstraint("CK_TrabajosImpresion_Copias", "\"Copias\" BETWEEN 1 AND 10");
                    table.CheckConstraint("CK_TrabajosImpresion_Vencimiento", "\"VenceEn\" > \"CreadoEn\"");
                    table.CheckConstraint("CK_TrabajosImpresion_Versiones", "\"VersionEsquema\" > 0 AND \"VersionPlantilla\" > 0");
                    table.ForeignKey(
                        name: "FK_TrabajosImpresion_EstacionesImpresion_IdEstacion",
                        column: x => x.IdEstacion,
                        principalTable: "EstacionesImpresion",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrabajosImpresion_Impresoras_IdImpresora",
                        column: x => x.IdImpresora,
                        principalTable: "Impresoras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrabajosImpresion_ReglasImpresion_IdRegla",
                        column: x => x.IdRegla,
                        principalTable: "ReglasImpresion",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TrabajosImpresion_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrabajosImpresion_TrabajosImpresion_IdTrabajoReimpreso",
                        column: x => x.IdTrabajoReimpreso,
                        principalTable: "TrabajosImpresion",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ComandosPedidoVisita_IdVisita",
                table: "ComandosPedidoVisita",
                column: "IdVisita");

            migrationBuilder.CreateIndex(
                name: "IX_EstacionesImpresion_IdSucursal_IdInstalacionCliente",
                table: "EstacionesImpresion",
                columns: new[] { "IdSucursal", "IdInstalacionCliente" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Impresoras_IdEstacion",
                table: "Impresoras",
                column: "IdEstacion");

            migrationBuilder.CreateIndex(
                name: "IX_Impresoras_IdEstacion_NombreSistemaNormalizado",
                table: "Impresoras",
                columns: new[] { "IdEstacion", "NombreSistemaNormalizado" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReglasImpresion_IdImpresora",
                table: "ReglasImpresion",
                column: "IdImpresora");

            migrationBuilder.CreateIndex(
                name: "IX_ReglasImpresion_IdSucursal",
                table: "ReglasImpresion",
                column: "IdSucursal");

            migrationBuilder.CreateIndex(
                name: "IX_ReglasImpresion_IdSucursal_IdImpresora_TipoSalida_Momento",
                table: "ReglasImpresion",
                columns: new[] { "IdSucursal", "IdImpresora", "TipoSalida", "Momento" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrabajosImpresion_Estado_ReservaVenceEn",
                table: "TrabajosImpresion",
                columns: new[] { "Estado", "ReservaVenceEn" },
                filter: "\"Estado\" IN ('Reservado', 'Enviando')");

            migrationBuilder.CreateIndex(
                name: "IX_TrabajosImpresion_IdEstacion",
                table: "TrabajosImpresion",
                column: "IdEstacion");

            migrationBuilder.CreateIndex(
                name: "IX_TrabajosImpresion_IdEstacion_Estado_DisponibleEn_CreadoEn",
                table: "TrabajosImpresion",
                columns: new[] { "IdEstacion", "Estado", "DisponibleEn", "CreadoEn" },
                filter: "\"Estado\" IN ('Pendiente', 'ReintentoProgramado')");

            migrationBuilder.CreateIndex(
                name: "IX_TrabajosImpresion_IdImpresora",
                table: "TrabajosImpresion",
                column: "IdImpresora");

            migrationBuilder.CreateIndex(
                name: "IX_TrabajosImpresion_IdRegla",
                table: "TrabajosImpresion",
                column: "IdRegla");

            migrationBuilder.CreateIndex(
                name: "IX_TrabajosImpresion_IdSucursal_ClaveIdempotencia",
                table: "TrabajosImpresion",
                columns: new[] { "IdSucursal", "ClaveIdempotencia" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrabajosImpresion_IdSucursal_IdSolicitud",
                table: "TrabajosImpresion",
                columns: new[] { "IdSucursal", "IdSolicitud" });

            migrationBuilder.CreateIndex(
                name: "IX_TrabajosImpresion_IdTrabajoReimpreso",
                table: "TrabajosImpresion",
                column: "IdTrabajoReimpreso");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ComandosPedidoVisita");

            migrationBuilder.DropTable(
                name: "TrabajosImpresion");

            migrationBuilder.DropTable(
                name: "ReglasImpresion");

            migrationBuilder.DropTable(
                name: "Impresoras");

            migrationBuilder.DropTable(
                name: "EstacionesImpresion");

            migrationBuilder.RenameColumn(
                name: "IdComandoAgregado",
                table: "ProductosPorVisita",
                newName: "AddCommandId");

            migrationBuilder.RenameIndex(
                name: "IX_ProductosPorVisita_IdVisita_IdComandoAgregado",
                table: "ProductosPorVisita",
                newName: "IX_ProductosPorVisita_IdVisita_AddCommandId");

            migrationBuilder.CreateTable(
                name: "PrintingStations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientInstallationId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CredentialCreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CredentialHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastAgentVersion = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    LastQzVersion = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    LastSeenAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrintingStations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrintingStations_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VisitOrderCommands",
                columns: table => new
                {
                    CommandId = table.Column<Guid>(type: "uuid", nullable: false),
                    VisitId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisitOrderCommands", x => x.CommandId);
                    table.ForeignKey(
                        name: "FK_VisitOrderCommands_Visitas_VisitId",
                        column: x => x.VisitId,
                        principalTable: "Visitas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PrinterDevices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StationId = table.Column<Guid>(type: "uuid", nullable: false),
                    DisplayName = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    Encoding = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Format = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    IsPresent = table.Column<bool>(type: "boolean", nullable: false),
                    LastSeenAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastStatus = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    PaperWidthMm = table.Column<short>(type: "smallint", nullable: false),
                    SystemPrinterName = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    SystemPrinterNameNormalized = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrinterDevices", x => x.Id);
                    table.CheckConstraint("CK_PrinterDevices_PaperWidthMm", "\"PaperWidthMm\" IN (58, 80)");
                    table.ForeignKey(
                        name: "FK_PrinterDevices_PrintingStations_StationId",
                        column: x => x.StationId,
                        principalTable: "PrintingStations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PrintRoutes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    PrinterDeviceId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    OutputType = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    Trigger = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrintRoutes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrintRoutes_PrinterDevices_PrinterDeviceId",
                        column: x => x.PrinterDeviceId,
                        principalTable: "PrinterDevices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrintRoutes_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrintJobs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdSucursal = table.Column<Guid>(type: "uuid", nullable: false),
                    PrinterDeviceId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReprintOfJobId = table.Column<Guid>(type: "uuid", nullable: true),
                    RouteId = table.Column<Guid>(type: "uuid", nullable: true),
                    StationId = table.Column<Guid>(type: "uuid", nullable: false),
                    AttemptCount = table.Column<short>(type: "smallint", nullable: false),
                    AvailableAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CopiesSnapshot = table.Column<short>(type: "smallint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DispatchStartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DocumentType = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    EncodingSnapshot = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FormatSnapshot = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    IdempotencyKey = table.Column<string>(type: "character varying(220)", maxLength: 220, nullable: false),
                    LastErrorCode = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    LastErrorDetail = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    LeaseExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LeaseId = table.Column<Guid>(type: "uuid", nullable: true),
                    PaperWidthMmSnapshot = table.Column<short>(type: "smallint", nullable: false),
                    PayloadJson = table.Column<string>(type: "jsonb", nullable: false),
                    RequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestedByPersonaId = table.Column<Guid>(type: "uuid", nullable: true),
                    SchemaVersion = table.Column<short>(type: "smallint", nullable: false),
                    SourceEntityId = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    SourceEntityType = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SpoolAcceptedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    SystemPrinterNameSnapshot = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    TemplateVersion = table.Column<short>(type: "smallint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrintJobs", x => x.Id);
                    table.CheckConstraint("CK_PrintJobs_AttemptCount", "\"AttemptCount\" >= 0");
                    table.CheckConstraint("CK_PrintJobs_CopiesSnapshot", "\"CopiesSnapshot\" BETWEEN 1 AND 10");
                    table.CheckConstraint("CK_PrintJobs_Expiry", "\"ExpiresAt\" > \"CreatedAt\"");
                    table.CheckConstraint("CK_PrintJobs_PaperWidthMmSnapshot", "\"PaperWidthMmSnapshot\" IN (58, 80)");
                    table.CheckConstraint("CK_PrintJobs_Versions", "\"SchemaVersion\" > 0 AND \"TemplateVersion\" > 0");
                    table.ForeignKey(
                        name: "FK_PrintJobs_PrintJobs_ReprintOfJobId",
                        column: x => x.ReprintOfJobId,
                        principalTable: "PrintJobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrintJobs_PrintRoutes_RouteId",
                        column: x => x.RouteId,
                        principalTable: "PrintRoutes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PrintJobs_PrinterDevices_PrinterDeviceId",
                        column: x => x.PrinterDeviceId,
                        principalTable: "PrinterDevices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrintJobs_PrintingStations_StationId",
                        column: x => x.StationId,
                        principalTable: "PrintingStations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrintJobs_Sucursales_IdSucursal",
                        column: x => x.IdSucursal,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PrinterDevices_StationId",
                table: "PrinterDevices",
                column: "StationId");

            migrationBuilder.CreateIndex(
                name: "IX_PrinterDevices_StationId_SystemPrinterNameNormalized",
                table: "PrinterDevices",
                columns: new[] { "StationId", "SystemPrinterNameNormalized" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PrintingStations_IdSucursal_ClientInstallationId",
                table: "PrintingStations",
                columns: new[] { "IdSucursal", "ClientInstallationId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_IdSucursal_IdempotencyKey",
                table: "PrintJobs",
                columns: new[] { "IdSucursal", "IdempotencyKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_IdSucursal_RequestId",
                table: "PrintJobs",
                columns: new[] { "IdSucursal", "RequestId" });

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_PrinterDeviceId",
                table: "PrintJobs",
                column: "PrinterDeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_ReprintOfJobId",
                table: "PrintJobs",
                column: "ReprintOfJobId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_RouteId",
                table: "PrintJobs",
                column: "RouteId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_StationId",
                table: "PrintJobs",
                column: "StationId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_StationId_Status_AvailableAt_CreatedAt",
                table: "PrintJobs",
                columns: new[] { "StationId", "Status", "AvailableAt", "CreatedAt" },
                filter: "\"Status\" IN ('Pending', 'RetryScheduled')");

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_Status_LeaseExpiresAt",
                table: "PrintJobs",
                columns: new[] { "Status", "LeaseExpiresAt" },
                filter: "\"Status\" IN ('Leased', 'Dispatching')");

            migrationBuilder.CreateIndex(
                name: "IX_PrintRoutes_IdSucursal",
                table: "PrintRoutes",
                column: "IdSucursal");

            migrationBuilder.CreateIndex(
                name: "IX_PrintRoutes_IdSucursal_PrinterDeviceId_OutputType_Trigger",
                table: "PrintRoutes",
                columns: new[] { "IdSucursal", "PrinterDeviceId", "OutputType", "Trigger" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PrintRoutes_PrinterDeviceId",
                table: "PrintRoutes",
                column: "PrinterDeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_VisitOrderCommands_VisitId",
                table: "VisitOrderCommands",
                column: "VisitId");
        }
    }
}
