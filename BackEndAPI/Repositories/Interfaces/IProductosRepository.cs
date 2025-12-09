using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IProductosRepository
    {
        Task<IEnumerable<Producto>> GetAllProductosAsync();
        Task<Producto> GetProductoByIdAsync(Guid id);
        Task AddProductoAsync(Producto producto);
        Task UpdateProductoAsync(Producto producto);
        Task DeleteProductoAsync(Guid id);
        Task<bool> ProductoExistsAsync(Guid id);
       

    }
}
