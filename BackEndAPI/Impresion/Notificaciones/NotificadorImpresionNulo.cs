namespace BackEndAPI.Impresion.Notificaciones;

public sealed class NotificadorImpresionNulo : INotificadorImpresion
{
    public Task TrabajosDisponiblesAsync(IEnumerable<Guid> idsEstaciones, CancellationToken tokenCancelacion) => Task.CompletedTask;
}
