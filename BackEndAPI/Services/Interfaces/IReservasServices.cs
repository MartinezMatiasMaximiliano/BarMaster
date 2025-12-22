using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IReservasServices
    {
        Task<IEnumerable<Reserva>> BuscarReservas();
        Task<Reserva?> ActualizarReserva(ModificarReservaDTO ReservaActualizada);
    }

}
