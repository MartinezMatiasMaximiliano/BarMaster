using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class PlanosRepository : IPlanosRepository
    {
        private readonly ICurrentDbContext _currentDbContext;
        private readonly AppDbContext db;
        public PlanosRepository(ICurrentDbContext currentDbContext)
        {
            _currentDbContext = currentDbContext;
            db = currentDbContext.Db;
        }
        public async Task<Plano> CrearPlano(Plano nuevoPlano)
        {
            await db.Planos.AddAsync(nuevoPlano);
            await db.SaveChangesAsync();
            return nuevoPlano;
        }
        public async Task<Plano?> ObtenerPlanoPorNombreYIdSucursal(string nombre, Guid IdSucursal)
        {
            return await db.Planos.Include(p => p.Mesas).FirstOrDefaultAsync(p => p.Nombre == nombre && p.IdSucursal == IdSucursal);
        }
        public async Task<Plano?> ObtenerPlanoPorId(Guid IdPlano)
        {
            return await db.Planos.Include(p => p.Mesas).FirstOrDefaultAsync(p => p.Id == IdPlano);
        }
        public async Task<IEnumerable<Plano>> BuscarListaDePlanos(Guid IdSucursal)
        {
            return await db.Planos.Include(p => p.Mesas).Where(p => p.IdSucursal == IdSucursal).ToListAsync();
        }
        public async Task<Plano> ActualizarPlano(Plano planoActualizado)
        {
            // Marcar solo las propiedades específicas como modificadas
            // Esto evita que EF actualice las relaciones de navegación (Mesas)
            db.Entry(planoActualizado).Property(p => p.Nombre).IsModified = true;
            db.Entry(planoActualizado).Property(p => p.Detalles).IsModified = true;
            
            await db.SaveChangesAsync();
            return planoActualizado;
        }

        public async Task<bool> EliminarPlano(Plano planoAEliminar)
        {
            db.Planos.Remove(planoAEliminar);
            await db.SaveChangesAsync();
            return true;
        }
    }
}
