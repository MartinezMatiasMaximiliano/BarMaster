using BackEndAPI.Models;
namespace BackEndAPI.Repositories.Interfaces
{
    public interface IPersonasRepository
    {
        Task<Persona?> GetPersonaPorId(Guid IdPersona);
        Task<Persona?> GetPersonaPorDni(string Dni);
        Task<Persona?> CrearPersona(Persona nuevaPersona);
        Task<Persona?> ActualizarPersona(Persona personaActualizada);
        Task<Persona?> EliminarPersona(Guid IdPersona);
        Task<List<Persona>> GetListaPersonasByEmpresaId(Guid IdEmpresa);
        Task<bool> EsCodigoUnico(string codigoDeServicio);
    }
}
