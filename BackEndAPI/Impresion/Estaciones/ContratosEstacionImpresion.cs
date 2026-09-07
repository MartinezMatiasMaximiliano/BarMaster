using BackEndAPI.Models.Impresion;
using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.Impresion.Estaciones;

public sealed record RegistrarEstacionImpresionSolicitud(
    Guid IdInstalacionCliente,
    [param: Required, StringLength(120, MinimumLength = 2)] string Nombre);

public sealed record EstablecerEstacionImpresionHabilitadaSolicitud(bool Habilitada);

public sealed record EstacionImpresionRespuesta(
    Guid Id,
    Guid IdInstalacionCliente,
    string Nombre,
    bool Habilitada,
    DateTime CreadoEn,
    DateTime? VistaPorUltimaVezEn,
    DateTime? RevocadaEn);
