using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface ITipoMovimientosCajaServices
    {
        Task<IEnumerable<TipoMovimientoCaja>> BuscarTiposMovimientoCaja();
        Task<TipoMovimientoCaja?> BuscarTipoMovimientoCajaPorId(int id);
        Task<TipoMovimientoCaja> CrearTipoMovimientoCaja(CrearTipoMovimientoCajaDTO request);
        Task<TipoMovimientoCaja?> EliminarTipoMovimientoCaja(int id);
    }
}

