using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class ProductosRepository : IProductosRepository
    {
        private readonly ApiDbContext _context;
        public ProductosRepository(ApiDbContext context)
        {
            _context = context;
        }

        public async Task AddProductoAsync(Producto producto)
        {
            await _context.Productos.AddAsync(producto);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteProductoAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<Producto>> GetAllProductosAsync()
        {
            return await _context.Productos.ToListAsync();
        }

        public Task<Producto> GetProductoByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> ProductoExistsAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task UpdateProductoAsync(Producto producto)
        {
            throw new NotImplementedException();
        }
    }
}
