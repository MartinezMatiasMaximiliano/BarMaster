using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.DTOs.Response;

namespace BackEndAPI.Services.Interfaces
{
    public interface IReservasServices
    {
        Task<IEnumerable<Reserva>> BuscarReservas(Guid idSucursal);
        Task<IEnumerable<Reserva>> BuscarReservasPorRangoFechas(Guid IdSucursal, DateTime Desde, DateTime? Hasta);
        Task<Reserva> CrearReserva(CrearReservaDTO request, Guid IdSucursal);
        Task<Reserva?> ActualizarReserva(ModificarReservaDTO ReservaActualizada, Guid idSucursal);
        Task<Reserva?> EliminarReserva(Guid Id, Guid idSucursal);
        Task<IReadOnlyList<DisponibilidadMesaDTO>> BuscarDisponibilidad(Guid idSucursal, DateTimeOffset fechaHora);
    }

}
