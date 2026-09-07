namespace BackEndAPI.Impresion.Dispositivos;

public interface IServicioImpresora
{
    Task<IReadOnlyList<ImpresoraRespuesta>> SincronizarAsync(Guid idEstacion, SincronizarInventarioImpresorasSolicitud solicitud, CancellationToken tokenCancelacion);
    Task<IReadOnlyList<ImpresoraRespuesta>> ObtenerParaEstacionAsync(Guid idEstacion, CancellationToken tokenCancelacion);
    Task<IReadOnlyList<ImpresoraRespuesta>> ObtenerParaSucursalAsync(CancellationToken tokenCancelacion);
    Task<ImpresoraRespuesta> ActualizarAsync(Guid idImpresora, ActualizarImpresoraSolicitud solicitud, CancellationToken tokenCancelacion);
}
