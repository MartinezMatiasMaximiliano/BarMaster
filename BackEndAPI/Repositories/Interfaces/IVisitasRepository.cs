using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IVisitasRepository
    {
        Task<Visita?> BuscarVisitaPorId(Guid? id);
        Task<Visita> CrearVisita(Visita request);
        Task<Visita> ModificarVisita(Visita request);
        Task<bool> EliminarVisita(Visita request);
    }
}
