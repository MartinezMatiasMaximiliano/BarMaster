using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IReservasRepository
    {
        Task<bool> MesaPerteneceASucursal(Guid idMesa, Guid idSucursal);
        Task<IEnumerable<Reserva>> GetAllReservas();
        Task<IEnumerable<Reserva>> GetReservasPorRangoFechas(Guid idSucursal, DateTime desde, DateTime hastaExclusive);
        Task<Reserva?> GetReservaPorId(Guid id);
        Task<Reserva> CrearReserva(Reserva nuevaReserva);
        Task<Reserva?> ActualizarReserva(Reserva reservaActualizada);
        Task<Reserva?> EliminarReserva(Reserva reservaAEliminar);
    }
}
