using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IProductosRepository
    {
        Task<IEnumerable<Producto>> GetAllProductosAsync();
        Task<Producto?> GetProductoPorId(Guid id);
        Task<Producto?> GetProductoPorNombre(string nombre);
        Task<Producto?> AddProducto(Producto producto,Menu menu);
        Task<Producto?> UpdateProducto(Producto producto);
        Task<Producto?> DeleteProductoAsync(Guid id);
        Task<bool> ProductoExiste(string nombre);
    }
}
