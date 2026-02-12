using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IVisitasRepository
    {
        Task<Visita?> BuscarVisitaPorId(Guid? id);
        Task<Visita?> BuscarVisitaActivaPorIdMesa(Guid idMesa);
        Task<Visita> CrearVisita(Visita request);
        Task<Visita> ModificarVisita(Visita request);
        Task<bool> EliminarVisita(Visita request);
        Task<IEnumerable<Visita>> ObtenerVisitasActivas();
        Task<IEnumerable<Visita>> ObtenerTodasLasVisitas();
        Task<bool> PagarProductos(Visita visita, ICollection<int> IdsProductos);
        Task<bool> EliminarProductos(Visita visita, ICollection<int> IdsProductos);
        Task<bool> CambiarEstadoProducto(int idProducto, string estado);
    }
}
