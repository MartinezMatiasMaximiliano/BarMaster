using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface ITipoMovimientosCajaRepository
    {
        Task<IEnumerable<TipoMovimientoCaja>> GetAllTiposMovimientoCaja();
        Task<TipoMovimientoCaja?> GetTipoMovimientoCajaPorId(int id);
        Task<TipoMovimientoCaja> CrearTipoMovimientoCaja(TipoMovimientoCaja tipoMovimientoCaja);
        Task<TipoMovimientoCaja?> EliminarTipoMovimientoCaja(TipoMovimientoCaja tipoMovimientoCaja);
    }
}

