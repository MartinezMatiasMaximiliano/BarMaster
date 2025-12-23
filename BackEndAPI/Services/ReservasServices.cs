using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace BackEndAPI.Services
{
    public class ReservasServices : IReservasServices
    {
        private readonly IReservasRepository _reservasRepository;

        public ReservasServices(IReservasRepository reservasRepository)
        {
            _reservasRepository = reservasRepository;
        }
        public async Task<IEnumerable<Reserva>> BuscarReservas() {
            return await _reservasRepository.GetAllReservas();
        }

        public async Task<Reserva> CrearReserva(CrearReservaDTO request, Guid IdSucursal)
        {
            if (string.IsNullOrWhiteSpace(request.NombreReserva))
            {
                throw new Exception("El nombre de la reserva es obligatorio");
            }

            Reserva nuevaReserva = new Reserva
            {
                IdSucursal = IdSucursal,
                IdEstadoReserva = request.IdEstadoReserva,
                FechaHora = request.FechaHora,
                NombreReserva = request.NombreReserva,
                CantidadDePersonas = request.CantidadDePersonas
            };

            return await _reservasRepository.CrearReserva(nuevaReserva);
        }

        public async Task<Reserva?> ActualizarReserva(ModificarReservaDTO ReservaActualizada) {
            var reserva = await _reservasRepository.GetReservaPorId(ReservaActualizada.Id) ?? throw new Exception("Reserva no encontrada");
            reserva.IdEstadoReserva = ReservaActualizada.IdEstadoReserva;
            reserva.FechaHora = !ReservaActualizada.FechaHora.ToString().IsNullOrEmpty() ? ReservaActualizada.FechaHora : reserva.FechaHora;
            reserva.NombreReserva = !String.IsNullOrEmpty(ReservaActualizada.NombreReserva) ? ReservaActualizada.NombreReserva : reserva.NombreReserva;
            reserva.CantidadDePersonas = ReservaActualizada.CantidadDePersonas.HasValue ? ReservaActualizada.CantidadDePersonas : reserva.CantidadDePersonas;
            return await _reservasRepository.ActualizarReserva(reserva);
        }

        public async Task<Reserva?> EliminarReserva(Guid Id) {
            var reserva = await _reservasRepository.GetReservaPorId(Id) ?? throw new Exception("Reserva no encontrada");
            return await _reservasRepository.EliminarReserva(reserva);
        }
    }
}
