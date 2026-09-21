using BackEndAPI.Models.Impresion;

namespace BackEndAPI.Impresion.Estaciones;

public interface IServicioEstacionImpresion
{
    Task<EstacionImpresionRespuesta> RegistrarAsync(RegistrarEstacionImpresionSolicitud solicitud, CancellationToken tokenCancelacion);
    Task<EstacionImpresionRespuesta?> ObtenerActualAsync(Guid idInstalacionCliente, CancellationToken tokenCancelacion);
    Task<EstacionImpresionRespuesta> RegistrarLatidoAsync(Guid idEstacion, CancellationToken tokenCancelacion);
    Task<EstacionImpresionRespuesta> EstablecerHabilitadaAsync(Guid idEstacion, bool habilitada, CancellationToken tokenCancelacion);
    Task<bool> PuedeUsarAsync(Guid idEstacion, CancellationToken tokenCancelacion);
}
