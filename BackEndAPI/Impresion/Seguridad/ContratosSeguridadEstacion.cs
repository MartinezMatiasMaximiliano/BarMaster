using BackEndAPI.Impresion.Estaciones;
using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.Impresion.Seguridad;

public sealed record DarAltaEstacionImpresionSolicitud(
    Guid IdInstalacionCliente,
    [param: Required, StringLength(120, MinimumLength = 2)] string Nombre);

public sealed record AltaEstacionImpresionRespuesta(
    EstacionImpresionRespuesta Estacion,
    string? Credencial,
    bool RequiereRotacionCredencial);

public sealed record CrearSesionEstacionImpresionSolicitud(
    Guid IdSucursal,
    Guid IdInstalacionCliente,
    [param: Required, MinLength(32), MaxLength(200)] string Credencial);

public sealed record SesionEstacionImpresionRespuesta(
    string TokenAcceso,
    DateTime VenceEnUtc,
    Guid IdEstacion,
    Guid IdSucursal);

public sealed record RotarCredencialEstacionImpresionRespuesta(
    Guid IdEstacion,
    string Credencial,
    DateTime CreadaEnUtc);
