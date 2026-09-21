namespace BackEndAPI.Impresion.Notificaciones;

public interface INotificadorImpresion
{
    Task TrabajosDisponiblesAsync(IEnumerable<Guid> idsEstaciones, CancellationToken tokenCancelacion);
}
