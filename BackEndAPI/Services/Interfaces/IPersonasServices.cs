using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IPersonasServices
    {
        Task<Persona?> CrearPersona(CrearPersonaDTO nuevaPersona,Guid IdEmpresa);
        Task<Persona?> BuscarPersonaPorId(Guid IdPersona);
        Task<Persona?> BuscarPersonaPorDni(string Dni);
        Task<ICollection<Persona>> BuscarTodasLasPersonas();
        Task<Persona?> ActualizarPersona(ModificarPersonaDTO personaActualizada);
        Task<Persona?> ActualizarPersonaje(Guid idPersona, int personajeId);
        Task<Persona?> CambiarEstado(Guid IdPersona);
        Task<Persona?> EliminarPersona(Guid IdPersona);
        Task<ICollection<Persona>> BuscarMozos();
    }
}
