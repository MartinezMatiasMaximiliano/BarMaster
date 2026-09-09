using BackEndAPI.Impresion.Notificaciones;
using BackEndAPI.Impresion.Estaciones;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BackEndAPI.Hubs;

[Authorize(Policy = "Impresion.Estacion")]
public sealed class HubImpresion : Hub
{
    private readonly IServicioEstacionImpresion servicioEstacion;
    private readonly ILogger<HubImpresion> logger;

    public HubImpresion(IServicioEstacionImpresion servicioEstacion, ILogger<HubImpresion> logger)
    {
        this.servicioEstacion = servicioEstacion;
        this.logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var idInquilino = Context.User?.FindFirst("TenantId")?.Value;
        var valorSucursal = Context.User?.FindFirst("IdSucursal")?.Value;
        var valorEstacion = Context.User?.FindFirst("EstacionImpresionId")?.Value;
        if (string.IsNullOrWhiteSpace(idInquilino)
            || !Guid.TryParse(valorSucursal, out var idSucursal)
            || !Guid.TryParse(valorEstacion, out var idEstacion))
        {
            logger.LogWarning("[IMPRESION_DIAGNOSTICO] {TimestampUtc:o} signalr.conexion_rechazada ConnectionId={ConnectionId} Motivo=claims_invalidos",
                DateTime.UtcNow, Context.ConnectionId);
            Context.Abort();
            return;
        }
        if (!await servicioEstacion.PuedeUsarAsync(idEstacion, Context.ConnectionAborted))
        {
            logger.LogWarning("[IMPRESION_DIAGNOSTICO] {TimestampUtc:o} signalr.conexion_rechazada ConnectionId={ConnectionId} IdEstacion={IdEstacion} Motivo=estacion_inhabilitada",
                DateTime.UtcNow, Context.ConnectionId, idEstacion);
            Context.Abort();
            return;
        }

        var grupo = GrupoHubImpresion.Para(idInquilino, idSucursal, idEstacion);
        await Groups.AddToGroupAsync(Context.ConnectionId, grupo);
        logger.LogInformation("[IMPRESION_DIAGNOSTICO] {TimestampUtc:o} signalr.estacion_conectada ConnectionId={ConnectionId} IdEstacion={IdEstacion} Grupo={Grupo}",
            DateTime.UtcNow, Context.ConnectionId, idEstacion, grupo);
        await base.OnConnectedAsync();
    }
}
