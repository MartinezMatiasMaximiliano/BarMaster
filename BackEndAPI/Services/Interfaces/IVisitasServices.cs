using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IVisitasServices
    {
        Task<Visita> AgregarProductos(ICollection<Producto> ListaProductos,Guid IdVisita);
    }
}
