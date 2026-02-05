using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IVisitasServices
    {
        Task<Visita> BuscarVisitaPorId(Guid IdVisita);
        Task<Visita> AgregarProductos(ICollection<AgregarProductoAVisita> ListaProductos,Guid IdVisita);
        Task<IEnumerable<Visita>> ObtenerVisitasActivasAsync();
    }
}
