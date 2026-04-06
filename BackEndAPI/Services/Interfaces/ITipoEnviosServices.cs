using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface ITipoEnviosServices
    {
        Task<IEnumerable<TipoEnvio>> BuscarListaTiposEnvio();
        Task<TipoEnvio> BuscarTipoEnvioPorId(int id);
        Task<TipoEnvio> CrearTipoEnvio(CrearTipoEnvioDTO request);
        Task<TipoEnvio?> ModificarTipoEnvio(int id, ModificarTipoEnvioDTO request);
        Task<TipoEnvio?> EliminarTipoEnvio(int id);
    }
}
