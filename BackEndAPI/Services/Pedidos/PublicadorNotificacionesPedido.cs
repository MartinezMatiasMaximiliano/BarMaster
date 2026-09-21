using BackEndAPI.Impresion.Trabajos;

namespace BackEndAPI.Services.Pedidos;

public interface IPublicadorNotificacionesPedido
{
    Task PublicarAsync(IReadOnlyList<CrearSolicitudImpresionRespuesta> solicitudes, Guid idComando);
}

public sealed class PublicadorNotificacionesPedido(
    IServicioTrabajoImpresion trabajos,
    ILogger<PublicadorNotificacionesPedido> logger) : IPublicadorNotificacionesPedido
{
    public async Task PublicarAsync(IReadOnlyList<CrearSolicitudImpresionRespuesta> solicitudes, Guid idComando)
    {
        foreach (var solicitud in solicitudes)
        {
            try { await trabajos.NotificarAsync(solicitud, CancellationToken.None); }
            catch (Exception ex)
            {
                logger.LogError(ex, "El pedido {IdComando} fue confirmado pero no se pudo notificar la impresión {IdSolicitud}",
                    idComando, solicitud.IdSolicitud);
            }
        }
    }
}
