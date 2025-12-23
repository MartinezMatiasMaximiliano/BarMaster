using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface ITipoPagosRepository
    {
        Task<IEnumerable<TipoPago>> GetAllTipoPagos();
        Task<TipoPago> CrearTipoPago(TipoPago tipoPago);
        Task<TipoPago?> EliminarTipoPago(TipoPago tipoPagoAEliminar);
        Task <TipoPago?> GetTipoPagoPorId(int id);
    }
}
