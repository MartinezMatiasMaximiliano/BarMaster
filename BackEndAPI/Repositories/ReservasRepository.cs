using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class ReservasRepository : IReservasRepository
    {
        private readonly ICurrentDbContext _currentDbContext;
        private readonly AppDbContext db;
        public ReservasRepository(ICurrentDbContext currentDbContext)
        {
            _currentDbContext= currentDbContext;
            db = _currentDbContext.Db;
        }
        public async Task<IEnumerable<Reserva>> GetAllReservas(Guid idSucursal)
        {
            return await db.Reservas.Include(r => r.Estado).Include(r => r.Mesa)
                .Where(r => r.IdSucursal == idSucursal).ToListAsync();
        }

        public async Task<IEnumerable<Reserva>> GetReservasPorRangoFechas(Guid idSucursal, DateTime desde, DateTime hastaExclusive)
        {
            return await db.Reservas
                .Include(r => r.Estado)
                .Include(r => r.Mesa)
                .Where(r =>
                    r.IdSucursal == idSucursal &&
                    r.FechaHora >= desde &&
                    r.FechaHora < hastaExclusive)
                .OrderBy(r => r.FechaHora)
                .ToListAsync();
        }

        public async Task<Reserva?> GetReservaPorId(Guid id, Guid idSucursal)
        {
            return await db.Reservas.Include(r => r.Estado).Include(r => r.Mesa)
                .FirstOrDefaultAsync(r => r.Id == id && r.IdSucursal == idSucursal);
        }

        public async Task<Reserva> CrearReserva(Reserva nuevaReserva)
        {
            await db.Reservas.AddAsync(nuevaReserva);
            await db.SaveChangesAsync();
            return await db.Reservas.Include(r => r.Estado).Include(r => r.Mesa).FirstOrDefaultAsync(r => r.Id == nuevaReserva.Id) ?? nuevaReserva;
        }

        public async Task<Reserva?> ActualizarReserva(Reserva reservaActualizada) {
            db.Entry(reservaActualizada).State = EntityState.Modified;
            await db.SaveChangesAsync();
            return reservaActualizada;
        }

        public Task<bool> ExisteReservaConfirmada(Guid idSucursal, Guid idMesa, DateTime fechaHora, Guid? excluirId = null) =>
            db.Reservas.AnyAsync(r => r.IdSucursal == idSucursal && r.IdMesa == idMesa &&
                r.FechaHora == fechaHora && r.IdEstadoReserva == 2 && (!excluirId.HasValue || r.Id != excluirId.Value));

        public Task<bool> MesaPerteneceASucursal(Guid idMesa, Guid idSucursal) =>
            db.Mesas.AnyAsync(m => m.Id == idMesa && m.Plano != null && m.Plano.IdSucursal == idSucursal);

        public async Task<Reserva?> EliminarReserva(Reserva reservaAEliminar) {
            db.Reservas.Remove(reservaAEliminar);
            await db.SaveChangesAsync();
            return reservaAEliminar;
        }
    }
}
