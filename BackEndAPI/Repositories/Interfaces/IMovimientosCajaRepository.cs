using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IMovimientosCajaRepository
    {
        Task<MovimientoCaja> CrearMovimientoCaja(MovimientoCaja movimientoCaja);
        Task<IEnumerable<MovimientoCaja>> GetAllMovimientosCaja();
        Task<MovimientoCaja?> GetMovimientoCajaPorId(Guid id);
        Task<IEnumerable<MovimientoCaja>> GetMovimientosCajaPorCaja(Guid idCaja);
        Task<MovimientoCaja?> ActualizarMovimientoCaja(MovimientoCaja movimientoCaja);
        Task<MovimientoCaja?> EliminarMovimientoCaja(MovimientoCaja movimientoCaja);
    }
}

