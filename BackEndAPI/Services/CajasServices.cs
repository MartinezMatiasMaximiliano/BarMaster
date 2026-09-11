using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Exceptions;
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
            if (request.MontoApertura < 0)
            {
                throw new BusinessRuleException("El monto de apertura no puede ser negativo");
            }
            
            var cajaAbierta = await _cajasRepository.BuscarCajaAbiertaPorIdSucursal(IdSucursal);
            if (cajaAbierta != null)
            {
                throw new ConflictException("Ya hay una caja abierta para esta sucursal");
            }

            var ultimaCajaCerrada = await _cajasRepository.BuscarUltimaCajaCerradaPorIdSucursal(IdSucursal);
            var montoApertura = ultimaCajaCerrada?.MontoCierre ?? request.MontoApertura;

            Caja nuevaCaja = new Caja
            {
                IdSucursal = IdSucursal,
                MontoApertura = montoApertura,
                MontoActual = montoApertura
            };
            return await _cajasRepository.CrearCaja(nuevaCaja);
        }

        public Task<Caja> BuscarCajaAbierta()
        {
            return _cajasRepository.BuscarCajaAbierta();
        }

        public Task<Caja> BuscarCajaAbiertaPorIdSucursal(Guid IdSucursal)
        {
            return _cajasRepository.BuscarCajaAbiertaPorIdSucursal(IdSucursal);
        }

        public async Task<Caja> CerrarCaja(Guid IdCaja, decimal montoCierre)
        {
            if (montoCierre < 0)
            {
                throw new BusinessRuleException("El monto de cierre no puede ser negativo");
            }

            var caja = await _cajasRepository.GetCajaPorId(IdCaja);
            if (caja == null)
            {
                throw new NotFoundException("Caja no encontrada");
            }

            if (caja.FechaCierre != null)
            {
                throw new ConflictException("La caja ya está cerrada");
            }

            caja.FechaCierre = DateTime.UtcNow;
            caja.MontoCierre = montoCierre;
            caja.Diferencia = caja.MontoCierre - caja.MontoActual;

            return await _cajasRepository.ActualizarCaja(caja);
        }

        public async Task<List<Caja>> BuscarListaCajas()
        {
            var cajas = await _cajasRepository.BuscarListaCajas();
            if (cajas == null || cajas.Count == 0)
            {
                throw new NotFoundException("No se encontraron cajas");
            }
            return cajas;
        }

        public async Task<Caja> BuscarCajaPorId(Guid id)
        {
            var caja = await _cajasRepository.GetCajaPorId(id);
            if (caja == null)
            {
                throw new NotFoundException("Caja no encontrada");
            }
            return caja;
        }
    }
}
