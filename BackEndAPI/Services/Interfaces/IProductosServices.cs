using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IProductosServices
    {
        Task<Producto?> CrearProducto(CrearProductoDTO producto, Guid idSucursal);
        Task<IEnumerable<Producto>> BuscarListaProductos();
        Task<Producto> BuscarProductoPorId(Guid idProducto);
        Task<Producto?> ActualizarProducto(ModificarProductoDTO producto);
        Task<Producto?> EliminarProducto(Guid idProducto);
        Task<bool> ProductoExiste(string nombre);
    }
}
