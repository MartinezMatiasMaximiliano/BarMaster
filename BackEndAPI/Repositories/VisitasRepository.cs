using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using Mono.TextTemplating;

namespace BackEndAPI.Repositories
{
    public class VisitasRepository : IVisitasRepository
    {
        private readonly ICurrentDbContext _context;
        private readonly AppDbContext db;

        public VisitasRepository(ICurrentDbContext context)
        {
            _context = context;
            db = context.Db;
        }

        public async Task<Visita?> BuscarVisitaPorId(Guid? id)
        {
            return await db.Visitas.Include(v => v.Productos).FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Visita> CrearVisita(Visita request)
        {
            await db.Visitas.AddAsync(request);
            await db.SaveChangesAsync();
            return request;
        }

        public async Task<Visita> ModificarVisita(Visita request)
        {
            db.Entry(request).State = EntityState.Modified;
            await db.SaveChangesAsync();
            return request;

        }

        public async Task<bool> EliminarVisita(Visita request)
        {
            db.Visitas.Remove(request);
            await db.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Visita>> ObtenerVisitasActivasAsync()
        {
            return await db.Visitas
                .Include(v => v.Mozo)
                .Include(v => v.Mesa)
                .Include(v => v.Productos)
                .Where(v => v.Estado == "Abierta")
                .ToListAsync();
        }

        public async Task<bool> PagarProductos(Visita visita, ICollection<int> IdsProductos)
        {
            // Marcar como pagados los productos que coincidan con los IDs proporcionados
            foreach (var producto in visita.Productos)
            {
                if (IdsProductos.Contains(producto.Id))
                {
                    producto.EstadoPagado = true;
                }
            }

            await db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EliminarProductos(Visita visita, ICollection<int> IdsProductos)
        {
            // Eliminar los productos que coincidan con los IDs proporcionados
            var productosAEliminar = visita.Productos
                .Where(p => IdsProductos.Contains(p.Id))
                .ToList();

            foreach (var producto in productosAEliminar)
            {
                db.ProductosPorVisita.Remove(producto);
            }

            await db.SaveChangesAsync();
            return true;
        }
    }
}
