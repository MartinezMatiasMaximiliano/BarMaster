using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class ProductosRepository : IProductosRepository
    {
        private readonly ICurrentDbContext _context;
        private readonly AppDbContext db;
        public ProductosRepository(ICurrentDbContext context)
        {
            _context = context;
            db = context.Db;
        }

        public async Task AddProductoAsync(Producto producto)
        {
            throw new NotImplementedException();
            //await _context.Productos.AddAsync(producto);
            //await _context.SaveChangesAsync();
        }

        public async Task DeleteProductoAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<Producto>> GetAllProductosAsync()
        {
            throw new NotImplementedException();
            //return await _context.Productos.ToListAsync();
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
