using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Exceptions;
using BackEndAPI.Models;
using BackEndAPI.Repositories;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Services.Horario;

namespace BackEndAPI.Services
{
    public class ReservasServices : IReservasServices
    {
        private readonly IReservasRepository _reservasRepository;
        private readonly IServicioHorario _horario;

        public ReservasServices(IReservasRepository reservasRepository, IServicioHorario horario)
        {
            _reservasRepository = reservasRepository;
            _horario = horario;
        }
        public async Task<IEnumerable<Reserva>> BuscarReservas(Guid idSucursal) {
            if (idSucursal == Guid.Empty) throw new Exception("Sucursal no identificada");
            return await _reservasRepository.GetAllReservas(idSucursal);
        }

        private static void ValidarEstado(int estado)
        {
            if (estado is not (2 or 3))
                throw new Exception("El estado de la reserva debe ser Confirmada o Cancelada.");
        }

        private DateTime NormalizarAlMinuto(DateTimeOffset fechaHora)
        {
            var utc = _horario.AUtc(fechaHora);
            return new DateTime(utc.Year, utc.Month, utc.Day, utc.Hour, utc.Minute, 0, DateTimeKind.Utc);
        }

        private async Task ValidarDisponibilidad(Guid idSucursal, Guid? idMesa, DateTime fechaHora, int estado, Guid? excluirId = null)
        {
            if (estado == 2 && idMesa.HasValue &&
                await _reservasRepository.ExisteReservaConfirmada(idSucursal, idMesa.Value, fechaHora, excluirId))
                throw new Exception("La mesa ya tiene una reserva confirmada en ese horario");
        }

        private static bool EsConflictoReserva(DbUpdateException ex) =>
            ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation,
                ConstraintName: "IX_Reservas_IdSucursal_IdMesa_FechaHora" };

        public async Task<IEnumerable<Reserva>> BuscarReservasPorRangoFechas(Guid IdSucursal, DateTimeOffset Desde, DateTimeOffset? Hasta)
        {
            if (IdSucursal == Guid.Empty) throw new BusinessRuleException("Sucursal no identificada");
            if (Desde == default) throw new BusinessRuleException("Fecha desde no enviada");

            var (desde, hastaExclusive) = _horario.RangoDiaLocal(Desde, Hasta);

            if (hastaExclusive <= desde) throw new BusinessRuleException("Rango de fechas inválido");

            return await _reservasRepository.GetReservasPorRangoFechas(IdSucursal, desde, hastaExclusive);
        }

        public async Task<Reserva> CrearReserva(CrearReservaDTO request, Guid IdSucursal)
        {
            if (IdSucursal == Guid.Empty) throw new BusinessRuleException("Sucursal no identificada");
            if (DateTime.Compare(request.FechaHora, DateTime.Now) < 0) throw new BusinessRuleException("La fecha y hora de la reserva no puede ser en el pasado");
            if (string.IsNullOrWhiteSpace(request.NombreReserva)) throw new BusinessRuleException("El nombre de la reserva es obligatorio");
            if (string.IsNullOrWhiteSpace(request.Telefono)) throw new BusinessRuleException("El teléfono de la reserva es obligatorio");

            ValidarEstado(request.IdEstadoReserva);
            await ValidarMesa(request.IdMesa, IdSucursal);
            var fechaHora = NormalizarAlMinuto(request.FechaHora);
            await ValidarDisponibilidad(IdSucursal, request.IdMesa, fechaHora, request.IdEstadoReserva);
            Reserva nuevaReserva = new Reserva
            {
                IdSucursal = IdSucursal,
                IdEstadoReserva = request.IdEstadoReserva,
                FechaHora = fechaHora,
                NombreReserva = request.NombreReserva,
                Telefono = request.Telefono,
                CantidadDePersonas = request.CantidadDePersonas,
                IdMesa = request.IdMesa
            };

            try { return await _reservasRepository.CrearReserva(nuevaReserva); }
            catch (DbUpdateException ex) when (EsConflictoReserva(ex))
            { throw new Exception("La mesa ya tiene una reserva confirmada en ese horario", ex); }
        }

        public async Task<Reserva?> ActualizarReserva(ModificarReservaDTO ReservaActualizada, Guid idSucursal) {
            ValidarEstado(ReservaActualizada.IdEstadoReserva);
            var reserva = await _reservasRepository.GetReservaPorId(ReservaActualizada.Id, idSucursal) ?? throw new NotFoundException("Reserva no encontrada");
            if (ReservaActualizada.MesaEspecificada)
            {
                await ValidarMesa(ReservaActualizada.IdMesa, idSucursal);
                reserva.IdMesa = ReservaActualizada.IdMesa;
            }
            reserva.IdEstadoReserva = ReservaActualizada.IdEstadoReserva;
            reserva.FechaHora = ReservaActualizada.FechaHora != default ? NormalizarAlMinuto(ReservaActualizada.FechaHora) : reserva.FechaHora;
            reserva.NombreReserva = !String.IsNullOrEmpty(ReservaActualizada.NombreReserva) ? ReservaActualizada.NombreReserva : reserva.NombreReserva;
            reserva.Telefono = !String.IsNullOrEmpty(ReservaActualizada.Telefono) ? ReservaActualizada.Telefono : reserva.Telefono;
            reserva.CantidadDePersonas = ReservaActualizada.CantidadDePersonas.HasValue ? ReservaActualizada.CantidadDePersonas : reserva.CantidadDePersonas;
            await ValidarDisponibilidad(idSucursal, reserva.IdMesa, reserva.FechaHora, reserva.IdEstadoReserva, reserva.Id);
            try { return await _reservasRepository.ActualizarReserva(reserva); }
            catch (DbUpdateException ex) when (EsConflictoReserva(ex))
            { throw new Exception("La mesa ya tiene una reserva confirmada en ese horario", ex); }
        }

        public async Task<Reserva?> EliminarReserva(Guid Id, Guid idSucursal) {
            var reserva = await _reservasRepository.GetReservaPorId(Id, idSucursal) ?? throw new NotFoundException("Reserva no encontrada");
            return await _reservasRepository.EliminarReserva(reserva);
        }

        public async Task<IReadOnlyList<DisponibilidadMesaDTO>> BuscarDisponibilidad(Guid idSucursal, DateTimeOffset fechaHora)
        {
            if (idSucursal == Guid.Empty) throw new Exception("Sucursal no identificada");
            var instante = _horario.AUtc(fechaHora);
            var minuto = new DateTime(instante.Year, instante.Month, instante.Day, instante.Hour, instante.Minute, 0, DateTimeKind.Utc);
            var mesas = await _reservasRepository.GetMesasConPlano(idSucursal);
            var reservas = await _reservasRepository.GetReservasConfirmadasCercanas(idSucursal, minuto.AddMinutes(-90), minuto.AddMinutes(90));
            var porMesa = reservas.GroupBy(r => r.IdMesa!.Value).ToDictionary(g => g.Key,
                g => g.Select(r => (int)Math.Abs((r.FechaHora - minuto).TotalMinutes)).ToArray());
            return mesas.Where(m => !porMesa.TryGetValue(m.Id, out var distancias) || !distancias.Contains(0))
                .Select(m =>
                {
                    var distancia = porMesa.TryGetValue(m.Id, out var valores) ? valores.Min() : (int?)null;
                    var estado = distancia <= 30 ? "roja" : distancia < 90 ? "amarilla" : "verde";
                    return new DisponibilidadMesaDTO(m.Id, m.Numero, m.Capacidad,
                        new PlanoDTO { Id = m.Plano!.Id, Nombre = m.Plano.Nombre, Detalles = m.Plano.Detalles, IdSucursal = m.Plano.IdSucursal },
                        estado, distancia);
                })
                .OrderBy(m => m.Plano.Nombre).ThenBy(m => m.EstadoDisponibilidad == "verde" ? 0 : m.EstadoDisponibilidad == "amarilla" ? 1 : 2)
                .ThenBy(m => m.Numero).ToList();
        }

        private async Task ValidarMesa(Guid? idMesa, Guid idSucursal)
        {
            if (idMesa.HasValue && !await _reservasRepository.MesaPerteneceASucursal(idMesa.Value, idSucursal))
                throw new Exception("La mesa no pertenece a la sucursal");
        }
    }
}
