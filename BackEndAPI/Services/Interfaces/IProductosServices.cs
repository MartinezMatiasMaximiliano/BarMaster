using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IProductosServices
    {
        Task<IEnumerable<Producto>> GetAllProductosAsync();
        Task<Producto> GetProductoByIdAsync(int id);
        Task AddProductoAsync(Producto producto);
        Task UpdateProductoAsync(Producto producto);
        Task DeleteProductoAsync(int id);
        Task<bool> ProductoExistsAsync(int id);
    }
}
