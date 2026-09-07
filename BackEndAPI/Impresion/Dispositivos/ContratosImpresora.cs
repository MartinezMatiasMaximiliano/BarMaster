using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.Impresion.Dispositivos;

public sealed record ImpresoraDetectadaSolicitud(
    [param: Required, StringLength(260, MinimumLength = 1)] string NombreSistema,
    string? Estado);

public sealed record SincronizarInventarioImpresorasSolicitud(
    [param: Required, StringLength(32, MinimumLength = 1)] string VersionAgente,
    [param: Required, StringLength(32, MinimumLength = 1)] string VersionQz,
    IReadOnlyList<ImpresoraDetectadaSolicitud> Impresoras);

public sealed record ActualizarImpresoraSolicitud(
    [param: Required, StringLength(120, MinimumLength = 2)] string NombreVisible,
    [param: Range(58, 80)] short AnchoPapelMm,
    [param: Required, StringLength(32, MinimumLength = 1)] string Codificacion,
    bool Habilitada);

public sealed record ImpresoraRespuesta(
    Guid Id,
    Guid IdEstacion,
    string NombreEstacion,
    string NombreSistema,
    string NombreVisible,
    short AnchoPapelMm,
    string Codificacion,
    bool Habilitada,
    bool Presente,
    DateTime VistaPorUltimaVezEn,
    string? UltimoEstado,
    bool EstacionEnLinea);
