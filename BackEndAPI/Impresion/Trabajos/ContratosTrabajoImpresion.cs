using BackEndAPI.Models.Impresion;
using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.Impresion.Trabajos;

public sealed record CrearTrabajosImpresionEnrutadosComando(
    Guid IdSolicitud,
    TipoDocumentoImpresion TipoDocumento,
    MomentoImpresion Momento,
    string ContenidoJson,
    short VersionEsquema,
    short VersionPlantilla,
    string ClaveIdempotenciaBase,
    string TipoEntidadOrigen,
    string IdEntidadOrigen,
    Guid? IdPersonaSolicitante,
    bool NotificarInmediatamente = true);

public sealed record ResumenTrabajoImpresionRespuesta(
    Guid Id,
    Guid IdSolicitud,
    TipoDocumentoImpresion TipoDocumento,
    string Destino,
    Guid IdEstacion,
    string Estacion,
    EstadoTrabajoImpresion Estado,
    DateTime CreadoEn,
    DateTime VenceEn,
    string? UltimoCodigoError);

public sealed record CrearSolicitudImpresionRespuesta(Guid IdSolicitud, IReadOnlyList<ResumenTrabajoImpresionRespuesta> Trabajos);

public sealed record TrabajoImpresionReservadoRespuesta(
    Guid Id,
    Guid IdSolicitud,
    DateTime CreadoEn,
    Guid IdReserva,
    DateTime ReservaVenceEn,
    TipoDocumentoImpresion TipoDocumento,
    short VersionEsquema,
    short VersionPlantilla,
    string ContenidoJson,
    string NombreSistema,
    short AnchoPapelMm,
    string Codificacion,
    short Copias);

public sealed record ReservarTrabajosImpresionSolicitud([param: Range(1, 20)] int MaximoTrabajos = 1);

public sealed record ReservaTrabajoImpresionSolicitud(Guid IdReserva);

public sealed record FallarTrabajoImpresionSolicitud(
    Guid IdReserva,
    [param: Required, StringLength(80, MinimumLength = 1)] string CodigoError,
    [param: StringLength(1000)] string? DetalleTecnico,
    bool Reintentable,
    bool Ambiguo,
    string? EstadoTrabajoQz);

public sealed record ReintentarTrabajoImpresionSolicitud([param: Required, StringLength(300, MinimumLength = 3)] string Motivo);

public sealed record CancelarTrabajoImpresionSolicitud([param: Required, StringLength(300, MinimumLength = 3)] string Motivo);

public sealed record ConsultaTrabajosImpresion(
    EstadoTrabajoImpresion? Estado,
    Guid? IdEstacion,
    DateTime? Desde,
    DateTime? Hasta,
    int Limite = 100);

public sealed record PanelImpresionRespuesta(
    int Pendiente,
    int RequiereAtencion,
    int AceptadosPorColaHoy,
    int EstacionesFueraDeLinea,
    int ImpresorasAusentes,
    DateTime? PendienteMasAntiguoEn);
