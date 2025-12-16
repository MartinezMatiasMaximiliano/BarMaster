using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IPersonasServices
    {
        Task<Persona?> CrearPersona(CrearPersonaDTO nuevaPersona,Guid IdEmpresa);
        Task<Persona?> BuscarPersonaPorId(Guid IdPersona);
        Task<Persona?> BuscarPersonaPorDni(string Dni);
        Task<Persona?> ActualizarPersona(ModificarPersonaDTO personaActualizada);
        Task<Persona?> CambiarEstado(Guid IdPersona);
        Task<Persona?> EliminarPersona(Guid IdPersona);
        Task<List<Persona>> GetPersonasByEmpresaId(Guid IdEmpresa);
    }
}
