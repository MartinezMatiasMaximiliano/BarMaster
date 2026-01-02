using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IMovimientosCajaServices
    {
        Task<MovimientoCaja> CrearMovimientoCaja(CrearMovimientoCajaDTO request);
        Task<IEnumerable<MovimientoCaja>> BuscarListaMovimientosCaja();
        Task<MovimientoCaja> BuscarMovimientoCajaPorId(Guid id);
        Task<MovimientoCaja?> EliminarMovimientoCaja(Guid id);
    }
}

