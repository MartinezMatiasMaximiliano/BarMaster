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

        public async Task<IEnumerable<Producto>> GetAllProductos()
        {
            return await db.Productos
                .Include(p => p.Categorias)
                .ToListAsync();
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

        public async Task<Producto?> UpdateProducto(Producto producto)
        {
            db.Entry(producto).State = EntityState.Modified;
            await db.SaveChangesAsync();
            return producto;
        }

        public async Task<Producto?> DeleteProducto(Producto producto)
        {
            db.Productos.Remove(producto);
            await db.SaveChangesAsync();
            return null;
        }

        public async Task<bool> ProductoExiste(string nombre)
        {
            return await db.Productos.AnyAsync(p => p.Nombre == nombre);
        }
    }
}
