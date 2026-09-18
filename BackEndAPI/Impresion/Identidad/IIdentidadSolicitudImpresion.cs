namespace BackEndAPI.Impresion.Identidad;

public interface IIdentidadSolicitudImpresion
{
    string IdInquilino { get; }
    Guid IdSucursal { get; }
    Guid? IdPersona { get; }
    Guid? IdEstacion { get; }
    string TipoAutenticacion { get; }
    string Rol { get; }
}
