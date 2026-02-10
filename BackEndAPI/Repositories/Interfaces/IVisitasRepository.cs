using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IVisitasRepository
    {
        Task<Visita?> BuscarVisitaPorId(Guid? id);
        /// <summary>Obtiene la visita en estado "Abierta" para la mesa indicada, si existe.</summary>
        Task<Visita?> BuscarVisitaActivaPorIdMesa(Guid idMesa);
        Task<Visita> CrearVisita(Visita request);
        Task<Visita> ModificarVisita(Visita request);
        Task<bool> EliminarVisita(Visita request);
        /// <summary>Obtiene las visitas en estado "Abierta" (mesa con visita activa).</summary>
        Task<IEnumerable<Visita>> ObtenerVisitasActivas();
        /// <summary>Obtiene todas las visitas (activas y cerradas) para reportes y gráficas.</summary>
        Task<IEnumerable<Visita>> ObtenerTodasLasVisitas();
        /// <summary>Marca como pagados los productos especificados de una visita.</summary>
        Task<bool> PagarProductos(Visita visita, ICollection<int> IdsProductos);
        /// <summary>Elimina los productos especificados de una visita.</summary>
        Task<bool> EliminarProductos(Visita visita, ICollection<int> IdsProductos);
    }
}
