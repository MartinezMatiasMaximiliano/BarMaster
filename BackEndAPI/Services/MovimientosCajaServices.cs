using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class MovimientosCajaServices : IMovimientosCajaServices
    {
        private readonly IMovimientosCajaRepository _movimientosCajaRepository;
        private readonly ITipoMovimientosCajaRepository _tipoMovimientosCajaRepository;
        private readonly ICajasRepository _cajasRepository;
        private readonly ICajasServices _cajasServices;

        public MovimientosCajaServices(IMovimientosCajaRepository movimientosCajaRepository, ICajasRepository cajasRepository, ITipoMovimientosCajaRepository tipoMovimientosCajaRepository, ICajasServices cajasServices)
        {
            _movimientosCajaRepository = movimientosCajaRepository;
            _cajasRepository = cajasRepository;
            _tipoMovimientosCajaRepository = tipoMovimientosCajaRepository;
            _cajasServices = cajasServices;
        }

        public async Task<MovimientoCaja> CrearMovimientoCaja(Guid IdSucursal,CrearMovimientoCajaDTO request)
        {

            var caja = await _cajasServices.BuscarCajaAbiertaPorIdSucursal(IdSucursal);
            if (caja == null) throw new Exception("La caja no existe");
            var TipoMovimiento = await _tipoMovimientosCajaRepository.GetTipoMovimientoCajaPorId(request.IdTipoMovimientoCaja);
            if (TipoMovimiento == null) throw new Exception("No existe este tipo de movimiento");

            MovimientoCaja nuevoMovimiento = new MovimientoCaja
            {
                IdTipoMovimientoCaja = request.IdTipoMovimientoCaja,
                IdCaja = caja.Id,
                IdVisita = null,
                MontoAbonado = request.MontoAbonado,
                MontoTotal = request.MontoTotal,
                Descripcion = request.Descripcion?.Trim() ?? string.Empty,
                FechaMovimiento = DateTime.UtcNow,
                TipoMovimientoCaja = TipoMovimiento,
            };


            if (TipoMovimiento.EsEfectivo == true)
            {
                CalcularVuelto(nuevoMovimiento,TipoMovimiento); 
                caja.MontoActual = TipoMovimiento.EsIngreso
                    ? caja.MontoActual + nuevoMovimiento.MontoTotal
                    : caja.MontoActual - nuevoMovimiento.MontoTotal;
            }

            var movimientoCreado = await _movimientosCajaRepository.CrearMovimientoCaja(nuevoMovimiento, caja);
            return movimientoCreado;
        }

        private void CalcularVuelto(MovimientoCaja movimiento, TipoMovimientoCaja tipoMovimiento)
        {
            movimiento.Vuelto = tipoMovimiento.EsIngreso == true
                ? movimiento.MontoAbonado - movimiento.MontoTotal
                : 0;
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

        public async Task<MovimientoCaja> BuscarTicketCompleto(Guid id)
        {
            var movimientoCaja = await _movimientosCajaRepository.GetTicketCompleto(id);
            if (movimientoCaja == null)
            {
                throw new Exception("El ticket no existe");
            }
            return movimientoCaja;
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

