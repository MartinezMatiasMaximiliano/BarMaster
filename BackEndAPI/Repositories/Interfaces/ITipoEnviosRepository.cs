using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface ITipoEnviosRepository
    {
        Task<ICollection<TipoEnvio>> GetAllTiposEnvio();
        Task<TipoEnvio?> GetTipoEnvioPorId(int id);
        Task<TipoEnvio?> GetTipoEnvioPorNombre(string nombre);
        Task<TipoEnvio> CrearTipoEnvio(TipoEnvio tipoEnvio);
        Task<TipoEnvio?> ActualizarTipoEnvio(TipoEnvio tipoEnvio);
        Task<TipoEnvio?> EliminarTipoEnvio(TipoEnvio tipoEnvio);
    }
}
