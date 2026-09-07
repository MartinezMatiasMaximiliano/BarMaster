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

    public NotificadorHubImpresion(IHubContext<HubImpresion> contextoHub, IIdentidadSolicitudImpresion identidad)
    {
        this.contextoHub = contextoHub;
        this.identidad = identidad;
    }

    public async Task TrabajosDisponiblesAsync(IEnumerable<Guid> idsEstaciones, CancellationToken tokenCancelacion)
    {
        foreach (var idEstacion in idsEstaciones.Distinct())
        {
            await contextoHub.Clients
                .Group(GrupoHubImpresion.Para(identidad.IdInquilino, identidad.IdSucursal, idEstacion))
                .SendCoreAsync("TrabajosImpresionDisponibles", [], tokenCancelacion);
        }
    }
}
