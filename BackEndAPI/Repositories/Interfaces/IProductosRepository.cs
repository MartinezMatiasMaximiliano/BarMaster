using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IProductosRepository
    {
        Task<IEnumerable<Producto>> GetAllProductos();
        Task<Producto?> GetProductoPorId(Guid id);
        Task<Producto?> GetProductoPorNombre(string nombre);
        Task<Producto?> AddProducto(Producto producto);
        Task<Producto?> UpdateProducto(Producto producto);
        Task<Producto?> DeleteProducto(Producto Producto);
        Task<bool> ProductoExiste(string nombre);
    }
}