using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class TipoPagosRepository : ITipoPagosRepository
    {
        private readonly ICurrentDbContext _currentDbContext;
        private readonly AppDbContext db;
        public TipoPagosRepository(ICurrentDbContext currentDbContext)
        {
            _currentDbContext= currentDbContext;
            db = _currentDbContext.Db;
        }

        public async Task<IEnumerable<TipoPago>> GetAllTipoPagos()
        {
            return await db.TipoPagos.ToListAsync();
        }

        public async Task<TipoPago> CrearTipoPago(TipoPago tipoPago) {
            await db.TipoPagos.AddAsync(tipoPago);
            await db.SaveChangesAsync();
            return tipoPago;
        }

        public async Task<TipoPago?> GetTipoPagoPorId(int id) {
            return await db.TipoPagos.FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<TipoPago?> EliminarTipoPago(TipoPago tipoPagoAEliminar) {
            db.TipoPagos.Remove(tipoPagoAEliminar);
            await db.SaveChangesAsync();
            return tipoPagoAEliminar;
        }
    }
}
