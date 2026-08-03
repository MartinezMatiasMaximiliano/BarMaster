using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IPagosRepository
    {
        Task<MovimientoCaja> CrearPago(Visita visita, MovimientoCaja pago, decimal montoRecibido);
    }
}
