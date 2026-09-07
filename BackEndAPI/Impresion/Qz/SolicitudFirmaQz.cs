using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.Impresion.Qz;

public sealed record SolicitudFirmaQz(
    [param: Required, RegularExpression("^[0-9a-f]{64}$")] string Solicitud,
    Guid IdEstacion);
