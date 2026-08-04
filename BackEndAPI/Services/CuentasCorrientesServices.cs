using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
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
            if (resultado == null ) throw new Exception("No se encontraron cuentas corrientes.");
            
            return resultado;

        }
        public async Task<CuentaCorriente?> GetCuentaCorrientePorId(Guid id)
        {
            var resultado = await _cuentasCorrientesRepository.GetCuentaCorrientePorId(id);
            if (resultado == null) throw new Exception("No se encontro la cuenta");

            return resultado;
        }
        public async Task<CuentaCorriente?> CrearCuentaCorriente(CrearCuentaCorrienteDTO cuentaCorrienteDTO)
        {
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
            var CuentaBuscada = await _cuentasCorrientesRepository.GetCuentaCorrientePorId(request.IdCuenta);
            if (CuentaBuscada == null) throw new Exception("No se encontró la cuenta corriente a modificar.");

            CuentaBuscada.Nombre = request.Nombre ?? CuentaBuscada.Nombre;
            CuentaBuscada.Telefono = request.Telefono ?? CuentaBuscada.Telefono;
            CuentaBuscada.Domicilo = request.Domicilio ?? CuentaBuscada.Domicilo;
            CuentaBuscada.Descuento = request.Descuento ?? CuentaBuscada.Descuento;

            return await _cuentasCorrientesRepository.ActualizarDatosCuentaCorriente(CuentaBuscada);

        }
        public async Task<CuentaCorriente?> CrearMovimientoCuentaCorriente(Guid idCuenta, CrearMovimientoCajaDTO request)
        {
            var cuentaCorriente = await _cuentasCorrientesRepository.GetCuentaCorrientePorId(idCuenta);
            if (cuentaCorriente == null) throw new Exception("No se encontro la cuenta");
            var nuevoMovimiento = await _movimientosCajaServices.CrearMovimientoCaja(request);
            if (nuevoMovimiento == null) throw new Exception("No se pudo crear el movimiento para la cuenta corriente.");
            cuentaCorriente.Movimientos.Add(new MovimientosCuentaCorriente
            {
                IdMovimientoCaja = nuevoMovimiento.Id,
                IdCuentaCorriente = cuentaCorriente.Id
            });

            var esIngreso = nuevoMovimiento.TipoMovimientoCaja?.EsIngreso ?? false;
            cuentaCorriente.Balance += esIngreso ? request.Monto : -request.Monto;
            return await _cuentasCorrientesRepository.ActualizarDatosCuentaCorriente(cuentaCorriente);
        }

        public async Task<bool> DesactivarCuentaCorriente(Guid idCuentaCorriente)
        {
            var busqueda = await _cuentasCorrientesRepository.GetCuentaCorrientePorId(idCuentaCorriente);
            if (busqueda == null) throw new Exception("Cuenta corriente no encontrada");
            if (busqueda.Balance != 0) throw new Exception("balance no nulo");
            var resultado = await _cuentasCorrientesRepository.DesactivarCuentaCorriente(busqueda);
            return true;
        }
        public async Task<bool> EliminarCuentaCorriente(Guid idCuentaCorriente)
        {
            var busqueda = await _cuentasCorrientesRepository.GetCuentaCorrientePorId(idCuentaCorriente);
            if (busqueda == null) throw new Exception("Cuenta corriente no encontrada");
            if (busqueda.Balance != 0) throw new Exception("balance no nulo");
            var resultado = await _cuentasCorrientesRepository.EliminarCuentaCorriente(busqueda);  
            return true;
        }
    }
}
