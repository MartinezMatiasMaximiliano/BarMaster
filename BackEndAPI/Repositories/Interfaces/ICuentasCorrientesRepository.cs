using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface ICuentasCorrientesRepository
    {
        Task<ICollection<CuentaCorriente>> GetListaCuentasCorrientes();
        Task<CuentaCorriente?> GetCuentaCorrientePorId(Guid id);
        Task<CuentaCorriente?> CrearCuentaCorriente(CuentaCorriente cuentaCorriente);
        Task<CuentaCorriente?> ActualizarDatosCuentaCorriente(CuentaCorriente cuentaCorriente);
        Task<bool> DesactivarCuentaCorriente(CuentaCorriente cuentaCorriente);
        Task<CuentaCorriente?> CrearMovimientoCuentaCorriente(CuentaCorriente cuentaCorriente, MovimientoCaja movimiento);
        Task<bool> EliminarCuentaCorriente(CuentaCorriente cuentaCorriente);
    }
}
