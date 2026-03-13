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

        public async Task<MovimientoCaja> CrearMovimientoCaja(MovimientoCaja movimientoCaja, Caja caja)
        {
            var transaccion = await db.Database.BeginTransactionAsync();
            try
            {
                await db.MovimientosCajas.AddAsync(movimientoCaja);

                db.Entry(caja).State = EntityState.Modified;

                await db.SaveChangesAsync();
                await transaccion.CommitAsync();
                return movimientoCaja;

            }
            catch (Exception ex)
            {
                await transaccion.RollbackAsync();
                throw new Exception("Error al crear el movimiento de caja");
            }
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

        public async Task<MovimientoCaja?> GetTicketCompleto(Guid id)
        {
            return await db.MovimientosCajas
                .Include(m => m.TipoMovimientoCaja)
                .Include(m => m.Caja)
                    .ThenInclude(c => c.Sucursal)
                .Include(m => m.Visita)
                    .ThenInclude(v => v!.Mesa)
                .Include(m => m.Visita)
                    .ThenInclude(v => v!.Mozo)
                .Include(m => m.Visita)
                    .ThenInclude(v => v!.Productos)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

    }
}

