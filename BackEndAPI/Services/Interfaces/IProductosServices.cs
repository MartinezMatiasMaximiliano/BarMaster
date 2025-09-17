using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IProductosServices
    {
        Task<IEnumerable<ProductoDTO>> GetAllProductosAsync();
        Task<ProductoDTO> GetProductoByIdAsync(int id);
        Task AddProductoAsync(ProductoDTO producto);
        Task UpdateProductoAsync(ProductoDTO producto);
        Task DeleteProductoAsync(int id);
        Task<bool> ProductoExistsAsync(int id);
    }
}
