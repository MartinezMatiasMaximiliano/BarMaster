using BackEndAPI.Models;
namespace BackEndAPI.Repositories.Interfaces
{
    public interface IPersonasRepository
    {
        Task<Persona?> CrearPersona(Persona nuevaPersona); 
        Task<Persona?> GetPersonaPorId(Guid IdPersona);
        Task<Persona?> GetPersonaPorDni(string Dni);
        Task<Persona?> GetPersonaPorCodigoDeServicio(string codigoDeServicio);
        Task<List<Persona>> GetListaPersonasByEmpresaId(Guid IdEmpresa);
        Task<Persona?> ActualizarPersona(Persona personaActualizada);
        Task<Persona?> EliminarPersona(Guid IdPersona);
        Task<bool> EsCodigoUnico(string codigoDeServicio);
    }
}
