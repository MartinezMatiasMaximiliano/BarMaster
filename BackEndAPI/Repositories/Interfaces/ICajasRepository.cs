using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface ICajasRepository
    {
        Task<Caja> CrearCaja(Caja caja);
        Task<Caja> BuscarCajaAbierta();
        Task<Caja?> GetCajaPorId(Guid id);
    }
}
