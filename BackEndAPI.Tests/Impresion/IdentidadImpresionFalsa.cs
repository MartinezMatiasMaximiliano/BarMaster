using BackEndAPI.Impresion.Identidad;

namespace BackEndAPI.Tests.Impresion;

internal sealed class IdentidadImpresionFalsa : IIdentidadSolicitudImpresion
{
    public string IdInquilino { get; init; } = "tenant-test";
    public Guid IdSucursal { get; init; }
    public Guid? IdPersona { get; init; }
    public Guid? IdEstacion { get; init; }
    public string TipoAutenticacion { get; init; } = "sucursal";
    public string Rol { get; init; } = string.Empty;
}
