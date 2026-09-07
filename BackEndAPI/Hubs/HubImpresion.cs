using BackEndAPI.Impresion.Notificaciones;
using BackEndAPI.Impresion.Estaciones;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BackEndAPI.Hubs;

[Authorize(Policy = "Impresion.Estacion")]
public sealed class HubImpresion : Hub
{
    private readonly IServicioEstacionImpresion servicioEstacion;

    public HubImpresion(IServicioEstacionImpresion servicioEstacion) => this.servicioEstacion = servicioEstacion;

    public override async Task OnConnectedAsync()
    {
        var idInquilino = Context.User?.FindFirst("IdInquilino")?.Value;
        var valorSucursal = Context.User?.FindFirst("IdSucursal")?.Value;
        var valorEstacion = Context.User?.FindFirst("EstacionImpresionId")?.Value;
        if (string.IsNullOrWhiteSpace(idInquilino)
            || !Guid.TryParse(valorSucursal, out var idSucursal)
            || !Guid.TryParse(valorEstacion, out var idEstacion))
        {
            Context.Abort();
            return;
        }
        if (!await servicioEstacion.PuedeUsarAsync(idEstacion, Context.ConnectionAborted))
        {
            Context.Abort();
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, GrupoHubImpresion.Para(idInquilino, idSucursal, idEstacion));
        await base.OnConnectedAsync();
    }
}
