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
        public async Task<IEnumerable<Reserva>> GetAllReservas()
        {
            return await db.Reservas.Include(r => r.Estado).ToListAsync();
        }
        public async Task<Reserva?> GetReservaPorId(Guid id)
        {
            return await db.Reservas.Include(r => r.Estado).FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<Reserva> CrearReserva(Reserva nuevaReserva)
        {
            await db.Reservas.AddAsync(nuevaReserva);
            await db.SaveChangesAsync();
            return await db.Reservas.Include(r => r.Estado).FirstOrDefaultAsync(r => r.Id == nuevaReserva.Id) ?? nuevaReserva;
        }

        public async Task<Reserva?> ActualizarReserva(Reserva reservaActualizada) {
            db.Entry(reservaActualizada).State = EntityState.Modified;
            await db.SaveChangesAsync();
            return reservaActualizada;
        }

        public async Task<Reserva?> EliminarReserva(Reserva reservaAEliminar) {
            db.Reservas.Remove(reservaAEliminar);
            await db.SaveChangesAsync();
            return reservaAEliminar;
        }
    }
}
