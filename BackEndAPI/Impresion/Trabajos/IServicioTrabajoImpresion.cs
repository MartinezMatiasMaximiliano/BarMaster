namespace BackEndAPI.Impresion.Trabajos;

public interface IServicioTrabajoImpresion
{
    Task<CrearSolicitudImpresionRespuesta> CrearEnrutadosAsync(CrearTrabajosImpresionEnrutadosComando comando, CancellationToken tokenCancelacion);
    Task<ResumenTrabajoImpresionRespuesta> CrearPruebaImpresoraAsync(Guid idImpresora, CancellationToken tokenCancelacion);
    Task NotificarAsync(CrearSolicitudImpresionRespuesta respuesta, CancellationToken tokenCancelacion);
    Task<IReadOnlyList<TrabajoImpresionReservadoRespuesta>> ReservarAsync(int maximoTrabajos, CancellationToken tokenCancelacion);
    Task MarcarEnviandoAsync(Guid idTrabajo, Guid idReserva, CancellationToken tokenCancelacion);
    Task RenovarReservaAsync(Guid idTrabajo, Guid idReserva, CancellationToken tokenCancelacion);
    Task MarcarAceptadoPorColaAsync(Guid idTrabajo, Guid idReserva, CancellationToken tokenCancelacion);
    Task MarcarFallidoAsync(Guid idTrabajo, FallarTrabajoImpresionSolicitud solicitud, CancellationToken tokenCancelacion);
    Task<IReadOnlyList<ResumenTrabajoImpresionRespuesta>> ObtenerPorSolicitudAsync(Guid idSolicitud, CancellationToken tokenCancelacion);
    Task<IReadOnlyList<ResumenTrabajoImpresionRespuesta>> ConsultarAsync(ConsultaTrabajosImpresion consulta, CancellationToken tokenCancelacion);
    Task<ResumenTrabajoImpresionRespuesta> ReintentarAsync(Guid idTrabajo, string motivo, CancellationToken tokenCancelacion);
    Task CancelarAsync(Guid idTrabajo, string motivo, CancellationToken tokenCancelacion);
    Task<PanelImpresionRespuesta> ObtenerPanelAsync(CancellationToken tokenCancelacion);
}
