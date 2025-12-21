using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class TipoPagosServices : ITipoPagosServices
    {
        private readonly ITipoPagosRepository _tipoPagosRepository;

        public TipoPagosServices(ITipoPagosRepository tipoPagosRepository)
        {
            _tipoPagosRepository = tipoPagosRepository;
        }
        public async Task<IEnumerable<TipoPago>> BuscarTipoPagos() {
            return await _tipoPagosRepository.GetAllTipoPagos();
        }

        public async Task<TipoPago?> BuscarTipoPagoPorId(int id) {
            var tipoPago = await _tipoPagosRepository.GetTipoPagoPorId(id);
            if (tipoPago == null) {
                throw new Exception("Tipo de pago no encontrado");
            }
            return tipoPago;
        }

        public async Task<TipoPago> CrearTipoPago(string nombre) {
            if (string.IsNullOrEmpty(nombre)) {
                throw new Exception("El nombre es obligatorio");
            }
            var tipoPago = new TipoPago {
                Nombre = nombre
            };
            return await _tipoPagosRepository.CrearTipoPago(tipoPago);
        }

        public async Task<TipoPago?> EliminarTipoPago(int id) {
            var tipoPago = await _tipoPagosRepository.GetTipoPagoPorId(id);
            if (tipoPago == null) {
                throw new Exception("Tipo de pago no encontrado");
            }
            return await _tipoPagosRepository.EliminarTipoPago(tipoPago);
        }
    }
}
