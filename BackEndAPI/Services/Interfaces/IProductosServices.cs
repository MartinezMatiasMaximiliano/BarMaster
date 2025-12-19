using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IProductosServices
    {
        Task<Producto?> CrearProducto(CrearProductoDTO producto);
        Task<IEnumerable<Producto>> BuscarListaProductos();
        Task<Producto> BuscarProductoPorId(int id);
        Task ActualizarProducto(Producto producto);
        Task EliminarProducto(int id);
        Task<bool> ProductoExiste(string nombre);
    }
}
