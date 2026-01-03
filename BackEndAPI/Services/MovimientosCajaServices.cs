using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class MovimientosCajaServices : IMovimientosCajaServices
    {
        private readonly IMovimientosCajaRepository _movimientosCajaRepository;
        private readonly ICajasRepository _cajasRepository;

        public MovimientosCajaServices(IMovimientosCajaRepository movimientosCajaRepository, ICajasRepository cajasRepository)
        {
            _movimientosCajaRepository = movimientosCajaRepository;
            _cajasRepository = cajasRepository;
        }

        public async Task<MovimientoCaja> CrearMovimientoCaja(CrearMovimientoCajaDTO request)
        {
            // Validar que la caja existe
            var caja = await _cajasRepository.GetCajaPorId(request.IdCaja);
            if (caja == null)
            {
                throw new Exception("La caja no existe");
            }

            // Validar que el monto sea mayor a 0
            if (request.Monto <= 0)
            {
                throw new Exception("El monto debe ser mayor a 0");
            }

            MovimientoCaja nuevoMovimiento = new MovimientoCaja
            {
                IdTipoMovimientoCaja = request.IdTipoMovimientoCaja,
                IdCaja = request.IdCaja,
                Monto = request.Monto,
                Descripcion = request.Descripcion,
                FechaMovimiento = DateTime.UtcNow
            };

            return await _movimientosCajaRepository.CrearMovimientoCaja(nuevoMovimiento);
        }

        public async Task<IEnumerable<MovimientoCaja>> BuscarListaMovimientosCaja()
        {
            return await _movimientosCajaRepository.GetAllMovimientosCaja();
        }

        public async Task<MovimientoCaja> BuscarMovimientoCajaPorId(Guid id)
        {
            var movimientoCaja = await _movimientosCajaRepository.GetMovimientoCajaPorId(id);
            if (movimientoCaja == null)
            {
                throw new Exception("El movimiento de caja no existe");
            }
            return movimientoCaja;
        }

        public async Task<IEnumerable<MovimientoCaja>> BuscarMovimientosCajaPorCaja(Guid idCaja)
        {
            // Validar que la caja existe
            var caja = await _cajasRepository.GetCajaPorId(idCaja);
            if (caja == null)
            {
                throw new Exception("La caja no existe");
            }

            return await _movimientosCajaRepository.GetMovimientosCajaPorCaja(idCaja);
        }

        public async Task<MovimientoCaja?> EliminarMovimientoCaja(Guid id)
        {
            var movimientoCajaAEliminar = await _movimientosCajaRepository.GetMovimientoCajaPorId(id);
            if (movimientoCajaAEliminar == null)
            {
                throw new Exception("El movimiento de caja no existe");
            }

            await _movimientosCajaRepository.EliminarMovimientoCaja(movimientoCajaAEliminar);
            return movimientoCajaAEliminar;
        }
    }
}

