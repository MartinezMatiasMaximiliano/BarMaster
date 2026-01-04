using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class TipoMovimientosCajaRepository : ITipoMovimientosCajaRepository
    {
        private readonly ICurrentDbContext _currentDbContext;
        private readonly AppDbContext db;

        public TipoMovimientosCajaRepository(ICurrentDbContext currentDbContext)
        {
            _currentDbContext = currentDbContext;
            db = _currentDbContext.Db;
        }

        public async Task<IEnumerable<TipoMovimientoCaja>> GetAllTiposMovimientoCaja()
        {
            return await db.TipoMovimientosCajas.ToListAsync();
        }

        public async Task<TipoMovimientoCaja?> GetTipoMovimientoCajaPorId(int id)
        {
            return await db.TipoMovimientosCajas.FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<TipoMovimientoCaja> CrearTipoMovimientoCaja(TipoMovimientoCaja tipoMovimientoCaja)
        {
            await db.TipoMovimientosCajas.AddAsync(tipoMovimientoCaja);
            await db.SaveChangesAsync();
            return tipoMovimientoCaja;
        }

        public async Task<TipoMovimientoCaja?> EliminarTipoMovimientoCaja(TipoMovimientoCaja tipoMovimientoCajaAEliminar)
        {
            db.TipoMovimientosCajas.Remove(tipoMovimientoCajaAEliminar);
            await db.SaveChangesAsync();
            return tipoMovimientoCajaAEliminar;
        }
    }
}

