using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Exceptions;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class CuentasCorrientesServices : ICuentasCorrientesServices
    {
        private readonly ICuentasCorrientesRepository _cuentasCorrientesRepository;
        private readonly IMovimientosCajaServices _movimientosCajaServices;
        public CuentasCorrientesServices(ICuentasCorrientesRepository cuentasCorrientesRepository, IMovimientosCajaServices movimientosCajaServices)
        {
            _cuentasCorrientesRepository = cuentasCorrientesRepository;
            _movimientosCajaServices = movimientosCajaServices;
        }

        public async Task<ICollection<CuentaCorriente>> GetListaCuentasCorrientes()
        {
            var resultado = await _cuentasCorrientesRepository.GetListaCuentasCorrientes();
            if (resultado == null) throw new NotFoundException("No se encontraron cuentas corrientes.");

            return resultado;

        }
        public async Task<CuentaCorriente?> GetCuentaCorrientePorId(Guid id)
        {
            var resultado = await _cuentasCorrientesRepository.GetCuentaCorrientePorId(id);
            if (resultado == null) throw new NotFoundException("No se encontró la cuenta corriente");

            return resultado;
        }
        public async Task<CuentaCorriente?> CrearCuentaCorriente(CrearCuentaCorrienteDTO cuentaCorrienteDTO)
        {
            if (string.IsNullOrWhiteSpace(cuentaCorrienteDTO.Nombre)
                || string.IsNullOrWhiteSpace(cuentaCorrienteDTO.Telefono)
                || string.IsNullOrWhiteSpace(cuentaCorrienteDTO.Domicilio))
                throw new BusinessRuleException("Todos los campos son obligatorios.");

            var nuevaCuentaCorriente = new CuentaCorriente
            {
                Nombre = cuentaCorrienteDTO.Nombre,
                Telefono = cuentaCorrienteDTO.Telefono,
                Domicilo = cuentaCorrienteDTO.Domicilio,
                Balance = 0,
                Descuento = 0
            };
            return await _cuentasCorrientesRepository.CrearCuentaCorriente(nuevaCuentaCorriente);
        }
        public async Task<CuentaCorriente?> ActualizarDatosCuentaCorriente(ModificarCuentaCorrienteDTO request)
        {
            if (request.IdCuenta == Guid.Empty)
                throw new BusinessRuleException("El Id de la cuenta corriente es obligatorio");

            var CuentaBuscada = await _cuentasCorrientesRepository.GetCuentaCorrientePorId(request.IdCuenta);
            if (CuentaBuscada == null) throw new NotFoundException("No se encontró la cuenta corriente a modificar.");

            CuentaBuscada.Nombre = request.Nombre ?? CuentaBuscada.Nombre;
            CuentaBuscada.Telefono = request.Telefono ?? CuentaBuscada.Telefono;
            CuentaBuscada.Domicilo = request.Domicilio ?? CuentaBuscada.Domicilo;
            CuentaBuscada.Descuento = request.Descuento ?? CuentaBuscada.Descuento;

            return await _cuentasCorrientesRepository.ActualizarDatosCuentaCorriente(CuentaBuscada);

        }
        public async Task<CuentaCorriente?> CrearMovimientoCuentaCorriente(Guid IdSucursal, Guid idCuenta, CrearMovimientoCajaDTO request)
        {
            if (idCuenta == Guid.Empty)
                throw new BusinessRuleException("El Id de la cuenta corriente es obligatorio");

            var cuentaCorriente = await _cuentasCorrientesRepository.GetCuentaCorrientePorId(idCuenta);
            if (cuentaCorriente == null) throw new NotFoundException("No se encontró la cuenta corriente");

            // La validación de los datos del movimiento (tipo, monto, caja abierta) ya la hace
            // MovimientosCajaServices.CrearMovimientoCaja con excepciones tipadas — no hace
            // falta repetirla acá.
            var nuevoMovimiento = await _movimientosCajaServices.CrearMovimientoCaja(IdSucursal, request);

            cuentaCorriente.Movimientos.Add(new MovimientosCuentaCorriente
            {
                IdMovimientoCaja = nuevoMovimiento.Id,
                IdCuentaCorriente = cuentaCorriente.Id
            });

            var esIngreso = nuevoMovimiento.TipoMovimientoCaja?.EsIngreso ?? false;
            cuentaCorriente.Balance += esIngreso ? request.MontoTotal : -request.MontoTotal;
            return await _cuentasCorrientesRepository.ActualizarDatosCuentaCorriente(cuentaCorriente);
        }

        public async Task<bool> DesactivarCuentaCorriente(Guid idCuentaCorriente)
        {
            var busqueda = await _cuentasCorrientesRepository.GetCuentaCorrientePorId(idCuentaCorriente);
            if (busqueda == null) throw new NotFoundException("No se encontró la cuenta corriente a desactivar.");
            if (busqueda.Balance != 0) throw new ConflictException("No se puede desactivar la cuenta corriente porque tiene un balance pendiente.");
            await _cuentasCorrientesRepository.DesactivarCuentaCorriente(busqueda);
            return true;
        }
        public async Task<bool> EliminarCuentaCorriente(Guid idCuentaCorriente)
        {
            var busqueda = await _cuentasCorrientesRepository.GetCuentaCorrientePorId(idCuentaCorriente);
            if (busqueda == null) throw new NotFoundException("No se encontró la cuenta corriente a eliminar.");
            if (busqueda.Balance != 0) throw new ConflictException("No se puede eliminar la cuenta corriente porque tiene un balance pendiente.");
            await _cuentasCorrientesRepository.EliminarCuentaCorriente(busqueda);
            return true;
        }
    }
}
