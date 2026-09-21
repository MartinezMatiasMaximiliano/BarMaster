using BackEndAPI.Hubs;
using BackEndAPI.Impresion.Identidad;
using Microsoft.AspNetCore.SignalR;

namespace BackEndAPI.Impresion.Notificaciones;

public static class GrupoHubImpresion
{
    public static string Para(string idInquilino, Guid idSucursal, Guid idEstacion) =>
        $"impresion:{idInquilino}:{idSucursal:N}:{idEstacion:N}";
}

public sealed class NotificadorHubImpresion : INotificadorImpresion
{
    private readonly IHubContext<HubImpresion> contextoHub;
    private readonly IIdentidadSolicitudImpresion identidad;
    private readonly ILogger<NotificadorHubImpresion> logger;

    public NotificadorHubImpresion(
        IHubContext<HubImpresion> contextoHub,
        IIdentidadSolicitudImpresion identidad,
        ILogger<NotificadorHubImpresion> logger)
    {
        this.contextoHub = contextoHub;
        this.identidad = identidad;
        this.logger = logger;
    }

    public async Task TrabajosDisponiblesAsync(IEnumerable<Guid> idsEstaciones, CancellationToken tokenCancelacion)
    {
        foreach (var idEstacion in idsEstaciones.Distinct())
        {
            var grupo = GrupoHubImpresion.Para(identidad.IdInquilino, identidad.IdSucursal, idEstacion);
            await contextoHub.Clients
                .Group(grupo)
                .SendCoreAsync("TrabajosImpresionDisponibles", [], tokenCancelacion);
            logger.LogInformation("[IMPRESION_DIAGNOSTICO] {TimestampUtc:o} signalr.notificacion_enviada IdEstacion={IdEstacion} Grupo={Grupo}",
                DateTime.UtcNow, idEstacion, grupo);
        }
    }
}
