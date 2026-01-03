using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class MovimientosCajaRepository : IMovimientosCajaRepository
    {
        private readonly ICurrentDbContext _currentDbContext;
        private readonly AppDbContext db;

        public MovimientosCajaRepository(ICurrentDbContext currentDbContext)
        {
            _currentDbContext = currentDbContext;
            db = _currentDbContext.Db;
        }

        public async Task<MovimientoCaja> CrearMovimientoCaja(MovimientoCaja movimientoCaja)
        {
            await db.MovimientosCajas.AddAsync(movimientoCaja);
            await db.SaveChangesAsync();
            return movimientoCaja;
        }

        public async Task<IEnumerable<MovimientoCaja>> GetAllMovimientosCaja()
        {
            return await db.MovimientosCajas
                .Include(m => m.TipoMovimientoCaja)
                .Include(m => m.Caja)
                .ToListAsync();
        }

        public async Task<MovimientoCaja?> GetMovimientoCajaPorId(Guid id)
        {
            return await db.MovimientosCajas
                .Include(m => m.TipoMovimientoCaja)
                .Include(m => m.Caja)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<IEnumerable<MovimientoCaja>> GetMovimientosCajaPorCaja(Guid idCaja)
        {
            return await db.MovimientosCajas
                .Include(m => m.TipoMovimientoCaja)
                .Include(m => m.Caja)
                .Where(m => m.IdCaja == idCaja)
                .OrderByDescending(m => m.FechaMovimiento)
                .ToListAsync();
        }

        public async Task<MovimientoCaja?> ActualizarMovimientoCaja(MovimientoCaja movimientoCaja)
        {
            db.Entry(movimientoCaja).State = EntityState.Modified;
            await db.SaveChangesAsync();
            return movimientoCaja;
        }

        public async Task<MovimientoCaja?> EliminarMovimientoCaja(MovimientoCaja movimientoCaja)
        {
            db.MovimientosCajas.Remove(movimientoCaja);
            await db.SaveChangesAsync();
            return movimientoCaja;
        }
    }
}

