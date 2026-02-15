using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IVisitasServices
    {
        Task<Visita> BuscarVisitaPorId(Guid IdVisita);
        Task<Visita> AgregarProductos(ICollection<AgregarProductoAVisita> ListaProductos,Guid IdVisita);
        Task<IEnumerable<Visita>> ObtenerVisitasActivas();
        Task<IEnumerable<Visita>> ObtenerTodasLasVisitas();
        Task<bool> PagarProductos(Guid IdVisita, ICollection<int> IdsProductos);
        Task<bool> EliminarProductos(Guid IdVisita, ICollection<int> IdsProductos);
        Task<bool> CambiarEstadoProducto(int idProducto, string estado);
    }
}
