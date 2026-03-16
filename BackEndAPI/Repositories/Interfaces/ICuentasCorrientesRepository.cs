using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface ICuentasCorrientesRepository
    {
        Task<ICollection<CuentaCorriente>> GetListaCuentasCorrientes();
        Task<CuentaCorriente?> GetCuentaCorrientePorId(Guid id);
        Task<CuentaCorriente?> CrearCuentaCorriente(CuentaCorriente cuentaCorriente);
        Task<CuentaCorriente?> ActualizarDatosCuentaCorriente(CuentaCorriente cuentaCorriente);
        //Task<CuentaCorriente?> CrearMovimientoCuentaCorriente(Guid idCuentaCorriente, MovimientoCaja movimiento);
        Task<bool> EliminarCuentaCorriente(CuentaCorriente CC);
    }
}
