using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface ITipoPagosServices
    {
        Task<IEnumerable<TipoPago>> BuscarTipoPagos();
        Task<TipoPago?> BuscarTipoPagoPorId(int id);
        Task<TipoPago> CrearTipoPago(string nombre);
        Task<TipoPago?> EliminarTipoPago(int id);
    }

}
