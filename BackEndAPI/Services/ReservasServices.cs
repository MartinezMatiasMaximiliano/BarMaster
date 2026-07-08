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

        private static DateTime FechaLocalInicioDiaUtc(DateTime fecha)
        {
            return DateTime.SpecifyKind(fecha.Date, DateTimeKind.Local).ToUniversalTime();
        }

        private static DateTime FechaLocalFinDiaExclusiveUtc(DateTime fecha)
        {
            return DateTime.SpecifyKind(fecha.Date.AddDays(1), DateTimeKind.Local).ToUniversalTime();
        }

        private static DateTime FechaHoraLocalUtc(DateTime fechaHora)
        {
            return fechaHora.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(fechaHora, DateTimeKind.Local).ToUniversalTime()
                : fechaHora.ToUniversalTime();
        }

        public async Task<IEnumerable<Reserva>> BuscarReservasPorRangoFechas(Guid IdSucursal, DateTime Desde, DateTime? Hasta)
        {
            if (IdSucursal == Guid.Empty) throw new Exception("Sucursal no identificada");

            var desde = FechaLocalInicioDiaUtc(Desde);
            var hastaExclusive = FechaLocalFinDiaExclusiveUtc(Hasta ?? Desde);

            if (hastaExclusive <= desde) throw new Exception("Rango de fechas inválido");

            return await _reservasRepository.GetReservasPorRangoFechas(IdSucursal, desde, hastaExclusive);
        }

        public async Task<Reserva> CrearReserva(CrearReservaDTO request, Guid IdSucursal)
        {
            Reserva nuevaReserva = new Reserva
            {
                IdSucursal = IdSucursal,
                IdEstadoReserva = request.IdEstadoReserva,
                FechaHora = FechaHoraLocalUtc(request.FechaHora),
                NombreReserva = request.NombreReserva,
                Telefono = request.Telefono,
                CantidadDePersonas = request.CantidadDePersonas,
                MesaReserva = string.Empty
            };

            return await _reservasRepository.CrearReserva(nuevaReserva);
        }

        public async Task<Reserva?> ActualizarReserva(ModificarReservaDTO ReservaActualizada) {
            var reserva = await _reservasRepository.GetReservaPorId(ReservaActualizada.Id) ?? throw new Exception("Reserva no encontrada");
            reserva.IdEstadoReserva = ReservaActualizada.IdEstadoReserva;
            reserva.FechaHora = !ReservaActualizada.FechaHora.ToString().IsNullOrEmpty() ? ReservaActualizada.FechaHora : reserva.FechaHora;
            reserva.NombreReserva = !String.IsNullOrEmpty(ReservaActualizada.NombreReserva) ? ReservaActualizada.NombreReserva : reserva.NombreReserva;
            reserva.Telefono = !String.IsNullOrEmpty(ReservaActualizada.Telefono) ? ReservaActualizada.Telefono : reserva.Telefono;
            reserva.CantidadDePersonas = ReservaActualizada.CantidadDePersonas.HasValue ? ReservaActualizada.CantidadDePersonas : reserva.CantidadDePersonas;
            return await _reservasRepository.ActualizarReserva(reserva);
        }

        public async Task<Reserva?> EliminarReserva(Guid Id) {
            var reserva = await _reservasRepository.GetReservaPorId(Id) ?? throw new Exception("Reserva no encontrada");
            return await _reservasRepository.EliminarReserva(reserva);
        }
    }
}
