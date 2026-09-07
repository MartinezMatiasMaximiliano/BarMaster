using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndAPI.Migrations;

/// <summary>
/// Españoliza el esquema de impresión sin recrear tablas ni perder datos.
/// </summary>
public partial class EspanolizarModuloImpresion : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameTable("PrintingStations", newName: "EstacionesImpresion");
        migrationBuilder.RenameTable("PrinterDevices", newName: "Impresoras");
        migrationBuilder.RenameTable("PrintRoutes", newName: "ReglasImpresion");
        migrationBuilder.RenameTable("PrintJobs", newName: "TrabajosImpresion");
        migrationBuilder.RenameTable("VisitOrderCommands", newName: "ComandosPedidoVisita");

        RenombrarColumnas(migrationBuilder, "EstacionesImpresion", new[]
        {
            ("ClientInstallationId", "IdInstalacionCliente"), ("Name", "Nombre"),
            ("Enabled", "Habilitada"), ("CreatedAt", "CreadoEn"),
            ("LastSeenAt", "VistaPorUltimaVezEn"), ("RevokedAt", "RevocadaEn"),
            ("CredentialHash", "HashCredencial"), ("CredentialCreatedAt", "CredencialCreadaEn"),
            ("LastAgentVersion", "UltimaVersionAgente"), ("LastQzVersion", "UltimaVersionQz")
        });
        RenombrarColumnas(migrationBuilder, "Impresoras", new[]
        {
            ("StationId", "IdEstacion"), ("SystemPrinterName", "NombreSistema"),
            ("SystemPrinterNameNormalized", "NombreSistemaNormalizado"), ("DisplayName", "NombreVisible"),
            ("Format", "Formato"), ("PaperWidthMm", "AnchoPapelMm"), ("Encoding", "Codificacion"),
            ("Enabled", "Habilitada"), ("IsPresent", "Presente"),
            ("LastSeenAt", "VistaPorUltimaVezEn"), ("LastStatus", "UltimoEstado"),
            ("UpdatedAt", "ActualizadoEn")
        });
        RenombrarColumnas(migrationBuilder, "ReglasImpresion", new[]
        {
            ("PrinterDeviceId", "IdImpresora"), ("OutputType", "TipoSalida"),
            ("Trigger", "Momento"), ("Enabled", "Habilitada"),
            ("CreatedAt", "CreadoEn"), ("UpdatedAt", "ActualizadoEn")
        });
        RenombrarColumnas(migrationBuilder, "TrabajosImpresion", new[]
        {
            ("RequestId", "IdSolicitud"), ("StationId", "IdEstacion"),
            ("PrinterDeviceId", "IdImpresora"), ("RouteId", "IdRegla"),
            ("RequestedByPersonaId", "IdPersonaSolicitante"), ("ReprintOfJobId", "IdTrabajoReimpreso"),
            ("DocumentType", "TipoDocumento"), ("SchemaVersion", "VersionEsquema"),
            ("TemplateVersion", "VersionPlantilla"), ("PayloadJson", "ContenidoJson"),
            ("SystemPrinterNameSnapshot", "NombreSistemaImpresora"), ("FormatSnapshot", "Formato"),
            ("PaperWidthMmSnapshot", "AnchoPapelMm"), ("EncodingSnapshot", "Codificacion"),
            ("CopiesSnapshot", "Copias"), ("Status", "Estado"),
            ("IdempotencyKey", "ClaveIdempotencia"), ("SourceEntityType", "TipoEntidadOrigen"),
            ("SourceEntityId", "IdEntidadOrigen"), ("CreatedAt", "CreadoEn"),
            ("AvailableAt", "DisponibleEn"), ("ExpiresAt", "VenceEn"),
            ("LeaseId", "IdReserva"), ("LeaseExpiresAt", "ReservaVenceEn"),
            ("DispatchStartedAt", "EnvioIniciadoEn"), ("SpoolAcceptedAt", "AceptadoPorColaEn"),
            ("AttemptCount", "CantidadIntentos"), ("LastErrorCode", "UltimoCodigoError"),
            ("LastErrorDetail", "UltimoDetalleError")
        });
        RenombrarColumnas(migrationBuilder, "ComandosPedidoVisita", new[]
        {
            ("CommandId", "IdComando"), ("VisitId", "IdVisita"), ("CreatedAt", "CreadoEn")
        });
        migrationBuilder.RenameColumn("AddCommandId", "ProductosPorVisita", "IdComandoAgregado");

        migrationBuilder.Sql("""
            UPDATE "Impresoras" SET "Formato" = 'Crudo' WHERE "Formato" = 'Raw';
            UPDATE "ReglasImpresion" SET "TipoSalida" = 'Comanda' WHERE "TipoSalida" = 'KitchenOrder';
            UPDATE "ReglasImpresion" SET "Momento" = CASE "Momento"
                WHEN 'ProductsAddedToTable' THEN 'AlCargarProductosMesa'
                WHEN 'BilledProductsPaid' THEN 'AlCobrarProductosFacturados'
                WHEN 'PreticketGenerated' THEN 'AlGenerarPreticket'
                WHEN 'UnbilledProductsPaid' THEN 'AlCobrarProductosSinFacturar'
                ELSE "Momento" END;
            UPDATE "TrabajosImpresion" SET "TipoDocumento" = CASE "TipoDocumento"
                WHEN 'PaymentReceipt' THEN 'ComprobantePago'
                WHEN 'KitchenOrder' THEN 'Comanda'
                ELSE "TipoDocumento" END;
            UPDATE "TrabajosImpresion" SET "Formato" = 'Crudo' WHERE "Formato" = 'Raw';
            UPDATE "TrabajosImpresion" SET "Estado" = CASE "Estado"
                WHEN 'Pending' THEN 'Pendiente'
                WHEN 'Leased' THEN 'Reservado'
                WHEN 'Dispatching' THEN 'Enviando'
                WHEN 'SpoolAccepted' THEN 'AceptadoPorCola'
                WHEN 'RetryScheduled' THEN 'ReintentoProgramado'
                WHEN 'NeedsAttention' THEN 'RequiereAtencion'
                WHEN 'Expired' THEN 'Vencido'
                WHEN 'Cancelled' THEN 'Cancelado'
                ELSE "Estado" END;
            """);

        RenombrarObjetos(migrationBuilder, invertir: false);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "Impresoras" SET "Formato" = 'Raw' WHERE "Formato" = 'Crudo';
            UPDATE "ReglasImpresion" SET "TipoSalida" = 'KitchenOrder' WHERE "TipoSalida" = 'Comanda';
            UPDATE "ReglasImpresion" SET "Momento" = CASE "Momento"
                WHEN 'AlCargarProductosMesa' THEN 'ProductsAddedToTable'
                WHEN 'AlCobrarProductosFacturados' THEN 'BilledProductsPaid'
                WHEN 'AlGenerarPreticket' THEN 'PreticketGenerated'
                WHEN 'AlCobrarProductosSinFacturar' THEN 'UnbilledProductsPaid'
                ELSE "Momento" END;
            UPDATE "TrabajosImpresion" SET "TipoDocumento" = CASE "TipoDocumento"
                WHEN 'ComprobantePago' THEN 'PaymentReceipt'
                WHEN 'Comanda' THEN 'KitchenOrder'
                ELSE "TipoDocumento" END;
            UPDATE "TrabajosImpresion" SET "Formato" = 'Raw' WHERE "Formato" = 'Crudo';
            UPDATE "TrabajosImpresion" SET "Estado" = CASE "Estado"
                WHEN 'Pendiente' THEN 'Pending'
                WHEN 'Reservado' THEN 'Leased'
                WHEN 'Enviando' THEN 'Dispatching'
                WHEN 'AceptadoPorCola' THEN 'SpoolAccepted'
                WHEN 'ReintentoProgramado' THEN 'RetryScheduled'
                WHEN 'RequiereAtencion' THEN 'NeedsAttention'
                WHEN 'Vencido' THEN 'Expired'
                WHEN 'Cancelado' THEN 'Cancelled'
                ELSE "Estado" END;
            """);

        RenombrarObjetos(migrationBuilder, invertir: true);
        migrationBuilder.RenameColumn("IdComandoAgregado", "ProductosPorVisita", "AddCommandId");
        RenombrarColumnas(migrationBuilder, "ComandosPedidoVisita", Invertir(new[]
        {
            ("CommandId", "IdComando"), ("VisitId", "IdVisita"), ("CreatedAt", "CreadoEn")
        }));
        RenombrarColumnas(migrationBuilder, "TrabajosImpresion", Invertir(new[]
        {
            ("RequestId", "IdSolicitud"), ("StationId", "IdEstacion"), ("PrinterDeviceId", "IdImpresora"),
            ("RouteId", "IdRegla"), ("RequestedByPersonaId", "IdPersonaSolicitante"),
            ("ReprintOfJobId", "IdTrabajoReimpreso"), ("DocumentType", "TipoDocumento"),
            ("SchemaVersion", "VersionEsquema"), ("TemplateVersion", "VersionPlantilla"),
            ("PayloadJson", "ContenidoJson"), ("SystemPrinterNameSnapshot", "NombreSistemaImpresora"),
            ("FormatSnapshot", "Formato"), ("PaperWidthMmSnapshot", "AnchoPapelMm"),
            ("EncodingSnapshot", "Codificacion"), ("CopiesSnapshot", "Copias"), ("Status", "Estado"),
            ("IdempotencyKey", "ClaveIdempotencia"), ("SourceEntityType", "TipoEntidadOrigen"),
            ("SourceEntityId", "IdEntidadOrigen"), ("CreatedAt", "CreadoEn"), ("AvailableAt", "DisponibleEn"),
            ("ExpiresAt", "VenceEn"), ("LeaseId", "IdReserva"), ("LeaseExpiresAt", "ReservaVenceEn"),
            ("DispatchStartedAt", "EnvioIniciadoEn"), ("SpoolAcceptedAt", "AceptadoPorColaEn"),
            ("AttemptCount", "CantidadIntentos"), ("LastErrorCode", "UltimoCodigoError"),
            ("LastErrorDetail", "UltimoDetalleError")
        }));
        RenombrarColumnas(migrationBuilder, "ReglasImpresion", Invertir(new[]
        {
            ("PrinterDeviceId", "IdImpresora"), ("OutputType", "TipoSalida"), ("Trigger", "Momento"),
            ("Enabled", "Habilitada"), ("CreatedAt", "CreadoEn"), ("UpdatedAt", "ActualizadoEn")
        }));
        RenombrarColumnas(migrationBuilder, "Impresoras", Invertir(new[]
        {
            ("StationId", "IdEstacion"), ("SystemPrinterName", "NombreSistema"),
            ("SystemPrinterNameNormalized", "NombreSistemaNormalizado"), ("DisplayName", "NombreVisible"),
            ("Format", "Formato"), ("PaperWidthMm", "AnchoPapelMm"), ("Encoding", "Codificacion"),
            ("Enabled", "Habilitada"), ("IsPresent", "Presente"), ("LastSeenAt", "VistaPorUltimaVezEn"),
            ("LastStatus", "UltimoEstado"), ("UpdatedAt", "ActualizadoEn")
        }));
        RenombrarColumnas(migrationBuilder, "EstacionesImpresion", Invertir(new[]
        {
            ("ClientInstallationId", "IdInstalacionCliente"), ("Name", "Nombre"), ("Enabled", "Habilitada"),
            ("CreatedAt", "CreadoEn"), ("LastSeenAt", "VistaPorUltimaVezEn"), ("RevokedAt", "RevocadaEn"),
            ("CredentialHash", "HashCredencial"), ("CredentialCreatedAt", "CredencialCreadaEn"),
            ("LastAgentVersion", "UltimaVersionAgente"), ("LastQzVersion", "UltimaVersionQz")
        }));

        migrationBuilder.RenameTable("ComandosPedidoVisita", newName: "VisitOrderCommands");
        migrationBuilder.RenameTable("TrabajosImpresion", newName: "PrintJobs");
        migrationBuilder.RenameTable("ReglasImpresion", newName: "PrintRoutes");
        migrationBuilder.RenameTable("Impresoras", newName: "PrinterDevices");
        migrationBuilder.RenameTable("EstacionesImpresion", newName: "PrintingStations");
    }

    private static void RenombrarColumnas(MigrationBuilder migrationBuilder, string tabla,
        IEnumerable<(string Anterior, string Nuevo)> columnas)
    {
        foreach (var (anterior, nuevo) in columnas)
            migrationBuilder.RenameColumn(anterior, tabla, nuevo);
    }

    private static IEnumerable<(string Anterior, string Nuevo)> Invertir(
        IEnumerable<(string Anterior, string Nuevo)> valores) => valores.Select(x => (x.Nuevo, x.Anterior));

    private static void RenombrarObjetos(MigrationBuilder migrationBuilder, bool invertir)
    {
        var objetos = new (string Tabla, string Anterior, string Nuevo, bool Indice)[]
        {
            ("EstacionesImpresion", "PK_PrintingStations", "PK_EstacionesImpresion", false),
            ("EstacionesImpresion", "FK_PrintingStations_Sucursales_IdSucursal", "FK_EstacionesImpresion_Sucursales_IdSucursal", false),
            ("EstacionesImpresion", "IX_PrintingStations_IdSucursal_ClientInstallationId", "IX_EstacionesImpresion_IdSucursal_IdInstalacionCliente", true),
            ("Impresoras", "PK_PrinterDevices", "PK_Impresoras", false),
            ("Impresoras", "CK_PrinterDevices_PaperWidthMm", "CK_Impresoras_AnchoPapelMm", false),
            ("Impresoras", "FK_PrinterDevices_PrintingStations_StationId", "FK_Impresoras_EstacionesImpresion_IdEstacion", false),
            ("Impresoras", "IX_PrinterDevices_StationId", "IX_Impresoras_IdEstacion", true),
            ("Impresoras", "IX_PrinterDevices_StationId_SystemPrinterNameNormalized", "IX_Impresoras_IdEstacion_NombreSistemaNormalizado", true),
            ("ReglasImpresion", "PK_PrintRoutes", "PK_ReglasImpresion", false),
            ("ReglasImpresion", "FK_PrintRoutes_PrinterDevices_PrinterDeviceId", "FK_ReglasImpresion_Impresoras_IdImpresora", false),
            ("ReglasImpresion", "FK_PrintRoutes_Sucursales_IdSucursal", "FK_ReglasImpresion_Sucursales_IdSucursal", false),
            ("ReglasImpresion", "IX_PrintRoutes_PrinterDeviceId", "IX_ReglasImpresion_IdImpresora", true),
            ("ReglasImpresion", "IX_PrintRoutes_IdSucursal", "IX_ReglasImpresion_IdSucursal", true),
            ("ReglasImpresion", "IX_PrintRoutes_IdSucursal_PrinterDeviceId_OutputType_Trigger", "IX_ReglasImpresion_IdSucursal_IdImpresora_TipoSalida_Momento", true),
            ("TrabajosImpresion", "PK_PrintJobs", "PK_TrabajosImpresion", false),
            ("TrabajosImpresion", "CK_PrintJobs_AttemptCount", "CK_TrabajosImpresion_CantidadIntentos", false),
            ("TrabajosImpresion", "CK_PrintJobs_CopiesSnapshot", "CK_TrabajosImpresion_Copias", false),
            ("TrabajosImpresion", "CK_PrintJobs_Expiry", "CK_TrabajosImpresion_Vencimiento", false),
            ("TrabajosImpresion", "CK_PrintJobs_PaperWidthMmSnapshot", "CK_TrabajosImpresion_AnchoPapelMm", false),
            ("TrabajosImpresion", "CK_PrintJobs_Versions", "CK_TrabajosImpresion_Versiones", false),
            ("TrabajosImpresion", "FK_PrintJobs_PrintJobs_ReprintOfJobId", "FK_TrabajosImpresion_TrabajosImpresion_IdTrabajoReimpreso", false),
            ("TrabajosImpresion", "FK_PrintJobs_PrintRoutes_RouteId", "FK_TrabajosImpresion_ReglasImpresion_IdRegla", false),
            ("TrabajosImpresion", "FK_PrintJobs_PrinterDevices_PrinterDeviceId", "FK_TrabajosImpresion_Impresoras_IdImpresora", false),
            ("TrabajosImpresion", "FK_PrintJobs_PrintingStations_StationId", "FK_TrabajosImpresion_EstacionesImpresion_IdEstacion", false),
            ("TrabajosImpresion", "FK_PrintJobs_Sucursales_IdSucursal", "FK_TrabajosImpresion_Sucursales_IdSucursal", false),
            ("TrabajosImpresion", "IX_PrintJobs_IdSucursal_IdempotencyKey", "IX_TrabajosImpresion_IdSucursal_ClaveIdempotencia", true),
            ("TrabajosImpresion", "IX_PrintJobs_IdSucursal_RequestId", "IX_TrabajosImpresion_IdSucursal_IdSolicitud", true),
            ("TrabajosImpresion", "IX_PrintJobs_PrinterDeviceId", "IX_TrabajosImpresion_IdImpresora", true),
            ("TrabajosImpresion", "IX_PrintJobs_ReprintOfJobId", "IX_TrabajosImpresion_IdTrabajoReimpreso", true),
            ("TrabajosImpresion", "IX_PrintJobs_RouteId", "IX_TrabajosImpresion_IdRegla", true),
            ("TrabajosImpresion", "IX_PrintJobs_StationId", "IX_TrabajosImpresion_IdEstacion", true),
            ("ComandosPedidoVisita", "PK_VisitOrderCommands", "PK_ComandosPedidoVisita", false),
            ("ComandosPedidoVisita", "FK_VisitOrderCommands_Visitas_VisitId", "FK_ComandosPedidoVisita_Visitas_IdVisita", false),
            ("ComandosPedidoVisita", "IX_VisitOrderCommands_VisitId", "IX_ComandosPedidoVisita_IdVisita", true),
            ("ProductosPorVisita", "IX_ProductosPorVisita_IdVisita_AddCommandId", "IX_ProductosPorVisita_IdVisita_IdComandoAgregado", true)
        };

        foreach (var objeto in objetos)
        {
            var anterior = invertir ? objeto.Nuevo : objeto.Anterior;
            var nuevo = invertir ? objeto.Anterior : objeto.Nuevo;
            if (objeto.Indice) migrationBuilder.RenameIndex(anterior, objeto.Tabla, nuevo);
            else migrationBuilder.Sql($"ALTER TABLE \"{objeto.Tabla}\" RENAME CONSTRAINT \"{anterior}\" TO \"{nuevo}\";");
        }

        var tabla = "TrabajosImpresion";
        if (!invertir)
        {
            migrationBuilder.DropIndex("IX_PrintJobs_Status_LeaseExpiresAt", tabla);
            migrationBuilder.DropIndex("IX_PrintJobs_StationId_Status_AvailableAt_CreatedAt", tabla);
            migrationBuilder.CreateIndex("IX_TrabajosImpresion_Estado_ReservaVenceEn", tabla,
                new[] { "Estado", "ReservaVenceEn" }, filter: "\"Estado\" IN ('Reservado', 'Enviando')");
            migrationBuilder.CreateIndex("IX_TrabajosImpresion_IdEstacion_Estado_DisponibleEn_CreadoEn", tabla,
                new[] { "IdEstacion", "Estado", "DisponibleEn", "CreadoEn" },
                filter: "\"Estado\" IN ('Pendiente', 'ReintentoProgramado')");
        }
        else
        {
            migrationBuilder.DropIndex("IX_TrabajosImpresion_Estado_ReservaVenceEn", tabla);
            migrationBuilder.DropIndex("IX_TrabajosImpresion_IdEstacion_Estado_DisponibleEn_CreadoEn", tabla);
            migrationBuilder.CreateIndex("IX_PrintJobs_Status_LeaseExpiresAt", tabla,
                new[] { "Estado", "ReservaVenceEn" }, filter: "\"Estado\" IN ('Leased', 'Dispatching')");
            migrationBuilder.CreateIndex("IX_PrintJobs_StationId_Status_AvailableAt_CreatedAt", tabla,
                new[] { "IdEstacion", "Estado", "DisponibleEn", "CreadoEn" },
                filter: "\"Estado\" IN ('Pending', 'RetryScheduled')");
        }
    }
}
