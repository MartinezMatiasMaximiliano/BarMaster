using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class TipoEnviosRepository : ITipoEnviosRepository
    {
        private readonly ICurrentDbContext _currentDbContext;
        private readonly AppDbContext db;

        public TipoEnviosRepository(ICurrentDbContext currentDbContext)
        {
            _currentDbContext = currentDbContext;
            db = _currentDbContext.Db;
        }

        public async Task<ICollection<TipoEnvio>> GetAllTiposEnvio()
        {
            return await db.TipoEnvios.OrderBy(t => t.Id).ToListAsync();
        }

        public async Task<TipoEnvio?> GetTipoEnvioPorId(int id)
        {
            return await db.TipoEnvios.FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<TipoEnvio?> GetTipoEnvioPorNombre(string nombre)
        {
            var nombreNormalizado = nombre.Trim().ToLower();
            return await db.TipoEnvios.FirstOrDefaultAsync(t => t.Nombre.ToLower() == nombreNormalizado);
        }

        public async Task<TipoEnvio> CrearTipoEnvio(TipoEnvio tipoEnvio)
        {
            await db.TipoEnvios.AddAsync(tipoEnvio);
            await db.SaveChangesAsync();
            return tipoEnvio;
        }

        public async Task<TipoEnvio?> ActualizarTipoEnvio(TipoEnvio tipoEnvio)
        {
            db.Entry(tipoEnvio).State = EntityState.Modified;
            await db.SaveChangesAsync();
            return tipoEnvio;
        }

        public async Task<TipoEnvio?> EliminarTipoEnvio(TipoEnvio tipoEnvio)
        {
            db.TipoEnvios.Remove(tipoEnvio);
            await db.SaveChangesAsync();
            return tipoEnvio;
        }
    }
}
