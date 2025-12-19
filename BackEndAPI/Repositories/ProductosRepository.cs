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

        public async Task<IEnumerable<Producto>> GetAllProductosAsync()
        {
            return await db.Productos.ToListAsync();
        }

        public async Task<Producto?> GetProductoPorId(Guid id)
        {
            return await db.Productos.FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Producto?> GetProductoPorNombre(string nombre)
        {
            return await db.Productos.FirstOrDefaultAsync(p => p.Nombre == nombre);
        }

        public async Task<Producto?> AddProducto(Producto producto)
        {
            await db.Productos.AddAsync(producto);
            await db.SaveChangesAsync();
            return producto;
        }

        public Task<Producto?> UpdateProducto(Producto producto)
        {
            throw new NotImplementedException();
        }

        public async Task<Producto?> DeleteProductoAsync(Guid id)
        {
            db.Productos.Remove(new Producto { Id = id});
            await db.SaveChangesAsync();
            return null;
        }

        public async Task<bool> ProductoExiste(string nombre)
        {
            return await db.Productos.AnyAsync(p => p.Nombre == nombre);
        }
    }
}
