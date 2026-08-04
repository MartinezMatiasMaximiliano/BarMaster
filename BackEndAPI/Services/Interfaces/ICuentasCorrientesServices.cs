using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface ICuentasCorrientesServices
    {
        Task<ICollection<CuentaCorriente>> GetListaCuentasCorrientes();
        Task<CuentaCorriente?> GetCuentaCorrientePorId(Guid id);
        Task<CuentaCorriente?> CrearCuentaCorriente(CrearCuentaCorrienteDTO cuentaCorriente);
        Task<CuentaCorriente?> ActualizarDatosCuentaCorriente(ModificarCuentaCorrienteDTO cuentaCorriente);
        Task<CuentaCorriente?> CrearMovimientoCuentaCorriente(Guid idCuentaCorriente, CrearMovimientoCajaDTO request);

        Task<bool> DesactivarCuentaCorriente(Guid idCuentaCorriente);
        Task<bool> EliminarCuentaCorriente(Guid idCuentaCorriente);

    }
}
