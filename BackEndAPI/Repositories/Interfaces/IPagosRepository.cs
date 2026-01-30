using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IPagosRepository
    {
        Task<Pago> CrearPago(Visita visita, Pago pago);
    }
}
