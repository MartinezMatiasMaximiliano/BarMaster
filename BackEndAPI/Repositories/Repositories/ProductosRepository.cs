using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories.Repositories
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

        public Task DeleteProductoAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<Producto>> GetAllProductosAsync()
        {
            return await _context.Productos.ToListAsync();
        }

        public Task<Producto> GetProductoByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> ProductoExistsAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task UpdateProductoAsync(Producto producto)
        {
            throw new NotImplementedException();
        }
    }
}
