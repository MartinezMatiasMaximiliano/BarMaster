using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IReservasRepository
    {
        Task<IEnumerable<Reserva>> GetAllReservas();
        Task<Reserva?> GetReservaPorId(Guid id);
        Task<Reserva?> ActualizarReserva(Reserva reservaActualizada);
    }
}
