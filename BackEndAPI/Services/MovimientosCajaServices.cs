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

        public MovimientosCajaServices(IMovimientosCajaRepository movimientosCajaRepository, ICajasRepository cajasRepository, ITipoMovimientosCajaRepository tipoMovimientosCajaRepository)
        {
            _movimientosCajaRepository = movimientosCajaRepository;
            _cajasRepository = cajasRepository;
            _tipoMovimientosCajaRepository = tipoMovimientosCajaRepository;
        }

        public async Task<MovimientoCaja> CrearMovimientoCaja(CrearMovimientoCajaDTO request)
        {
           
                var caja = await _cajasRepository.GetCajaPorId(request.IdCaja);
                if (caja == null)
                {
                    throw new Exception("La caja no existe");
                }

                var TipoMovimiento = await _tipoMovimientosCajaRepository.GetTipoMovimientoCajaPorId(request.IdTipoMovimientoCaja);

                if (TipoMovimiento == null)
                {
                    throw new Exception("No existe este tipo de movimiento");
                }

                MovimientoCaja nuevoMovimiento = new MovimientoCaja
                {
                    IdTipoMovimientoCaja = request.IdTipoMovimientoCaja,
                    IdCaja = request.IdCaja,
                    IdVisita = null,
                    Monto = request.Monto,
                    Descripcion = request.Descripcion,
                    FechaMovimiento = DateTime.UtcNow,
                    TipoMovimientoCaja = TipoMovimiento,

                };

                if (TipoMovimiento.EsEfectivo == true)
                {
                    if (TipoMovimiento.EsIngreso == true)
                    {
                        caja.MontoActual = caja.MontoActual + request.Monto;
                    }
                    else
                    {
                        caja.MontoActual = caja.MontoActual - request.Monto;
                    }
                }

                var movimientoCreado = await _movimientosCajaRepository.CrearMovimientoCaja(nuevoMovimiento,caja);
                return movimientoCreado;


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

