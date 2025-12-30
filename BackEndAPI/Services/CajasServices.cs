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

        public async Task<Caja> CrearCaja(CrearCajaDTO request)
        {
            Caja nuevaCaja = new Caja
            {
                IdSucursal = request.IdSucursal, 
                MontoApertura = request.MontoApertura,

            };
            return await _cajasRepository.CrearCaja(nuevaCaja);
        }

        public Task<Caja> BuscarCajaAbierta()
        {
            return _cajasRepository.BuscarCajaAbierta();
        }

    }
}
