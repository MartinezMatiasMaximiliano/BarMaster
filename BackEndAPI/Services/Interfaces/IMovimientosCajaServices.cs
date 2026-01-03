using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IMovimientosCajaServices
    {
        Task<MovimientoCaja> CrearMovimientoCaja(CrearMovimientoCajaDTO request);
        Task<IEnumerable<MovimientoCaja>> BuscarListaMovimientosCaja();
        Task<MovimientoCaja> BuscarMovimientoCajaPorId(Guid id);
        Task<IEnumerable<MovimientoCaja>> BuscarMovimientosCajaPorCaja(Guid idCaja);
        Task<MovimientoCaja?> EliminarMovimientoCaja(Guid id);
    }
}

