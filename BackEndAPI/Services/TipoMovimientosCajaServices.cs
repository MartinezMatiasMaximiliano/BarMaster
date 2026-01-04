using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class TipoMovimientosCajaServices : ITipoMovimientosCajaServices
    {
        private readonly ITipoMovimientosCajaRepository _tipoMovimientosCajaRepository;

        public TipoMovimientosCajaServices(ITipoMovimientosCajaRepository tipoMovimientosCajaRepository)
        {
            _tipoMovimientosCajaRepository = tipoMovimientosCajaRepository;
        }

        public async Task<IEnumerable<TipoMovimientoCaja>> BuscarTiposMovimientoCaja()
        {
            return await _tipoMovimientosCajaRepository.GetAllTiposMovimientoCaja();
        }

        public async Task<TipoMovimientoCaja?> BuscarTipoMovimientoCajaPorId(int id)
        {
            var tipo = await _tipoMovimientosCajaRepository.GetTipoMovimientoCajaPorId(id);
            if (tipo == null)
            {
                throw new Exception("Tipo de movimiento de caja no encontrado");
            }
            return tipo;
        }

        public async Task<TipoMovimientoCaja> CrearTipoMovimientoCaja(CrearTipoMovimientoCajaDTO request)
        {
            if (string.IsNullOrEmpty(request.Nombre))
            {
                throw new Exception("El nombre es obligatorio");
            }

            var tipoMovimientoCaja = new TipoMovimientoCaja
            {
                Nombre = request.Nombre,
                EsIngreso = request.EsIngreso,
                EsEfectivo = request.EsEfectivo
            };

            return await _tipoMovimientosCajaRepository.CrearTipoMovimientoCaja(tipoMovimientoCaja);
        }

        public async Task<TipoMovimientoCaja?> EliminarTipoMovimientoCaja(int id)
        {
            var tipoMovimientoCaja = await _tipoMovimientosCajaRepository.GetTipoMovimientoCajaPorId(id);
            if (tipoMovimientoCaja == null)
            {
                throw new Exception("Tipo de movimiento de caja no encontrado");
            }

            return await _tipoMovimientosCajaRepository.EliminarTipoMovimientoCaja(tipoMovimientoCaja);
        }
    }
}

