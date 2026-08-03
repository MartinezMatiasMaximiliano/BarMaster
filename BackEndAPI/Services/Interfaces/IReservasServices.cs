using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IReservasServices
    {
        Task<IEnumerable<Reserva>> BuscarReservas();
        Task<IEnumerable<Reserva>> BuscarReservasPorRangoFechas(Guid IdSucursal, DateTime Desde, DateTime? Hasta);
        Task<Reserva> CrearReserva(CrearReservaDTO request, Guid IdSucursal);
        Task<Reserva?> ActualizarReserva(ModificarReservaDTO ReservaActualizada);
        Task<Reserva?> EliminarReserva(Guid Id);
    }

}
