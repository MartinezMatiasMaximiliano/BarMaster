using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class CajasServices : ICajasServices
    {
        private readonly ICajasRepository _cajasRepository;
        public CajasServices(ICajasRepository cajasRepository)
        {
            _cajasRepository = cajasRepository;
        }

        public async Task<Caja> CrearCaja(CrearCajaDTO request, Guid IdSucursal)
        {
            Caja nuevaCaja = new Caja
            {
                IdSucursal = IdSucursal, 
                MontoApertura = request.MontoApertura,

            };
            return await _cajasRepository.CrearCaja(nuevaCaja);
        }

        public Task<Caja> BuscarCajaAbierta()
        {
            return _cajasRepository.BuscarCajaAbierta();
        }

        public async Task<Caja> CerrarCaja(Guid IdCaja)
        {
            var caja = await _cajasRepository.GetCajaPorId(IdCaja);
            if (caja == null)
            {
                throw new Exception("Caja no encontrada");
            }

            if (caja.FechaCierre != null)
            {
                throw new Exception("La caja ya está cerrada");
            }

            caja.FechaCierre = DateTime.UtcNow;
            return await _cajasRepository.ActualizarCaja(caja);
        }

        public async Task<List<Caja>> BuscarListaCajas()
        {
            return await _cajasRepository.BuscarListaCajas();
        }

        public async Task<Caja> BuscarCajaPorId(Guid id)
        {
            var caja = await _cajasRepository.GetCajaPorId(id);
            if (caja == null)
            {
                throw new Exception("Caja no encontrada");
            }
            return caja;
        }
    }
}
