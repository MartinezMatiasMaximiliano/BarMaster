using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;
using Humanizer;

namespace BackEndAPI.Services
{
    public class PersonasServices : IPersonasServices
    {
        private readonly IPersonasRepository _personasRepository;
        private readonly PasswordService _passwordService;

        public PersonasServices(IPersonasRepository personasRepository, PasswordService passwordService)
        {
            _personasRepository = personasRepository;
            _passwordService = passwordService;
        }
        public async Task<Persona?> CrearPersona(CrearPersonaDTO nuevaPersona, Guid IdEmpresa)
        {
            var existente = await _personasRepository.GetPersonaPorDni(nuevaPersona.Dni);
            if (existente == null) {
                throw new Exception("Ya existe una persona con el mismo DNI.");
            }

            var usuario = new Persona
            {
                IdRol = nuevaPersona.IdRol,
                IdEmpresa = IdEmpresa,
                Nombres = nuevaPersona.Nombres,
                Apellido = nuevaPersona.Apellido,
                Dni = nuevaPersona.Dni,
                Email = nuevaPersona.Email,
                Direccion = nuevaPersona.Direccion,
                Telefono = nuevaPersona.Telefono,
                Activo = nuevaPersona.Activo,
            };

            _passwordService.CrearPasswordHash(nuevaPersona.Password, out byte[] hashContrasena, out byte[] saltContrasena); // Genera hash y salt
            usuario.EstablecerContrasena(hashContrasena, saltContrasena);

            string PINUnico; 

            do
            {
                PINUnico = Helpers.CrearPINServicio();
            }
            while (await _personasRepository.EsCodigoUnico(PINUnico));

            usuario.CodigoDeServicio = PINUnico;
            await _personasRepository.CrearPersona(usuario);
            return usuario;
        }
        public Task<Persona?> ActualizarPersona(ModificarPersonaDTO personaActualizada)
        {
            throw new NotImplementedException();
        }
        public async Task<Persona?> CambiarEstado(Guid IdPersona)
        {
            var persona =  await _personasRepository.GetPersonaPorId(IdPersona);
            if (persona == null)
            {
                throw new Exception("Persona no identificada");
            }
            persona.Activo = !persona.Activo;
            await _personasRepository.ActualizarPersona(persona);
            return persona;
        }
        public Task<Persona?> BuscarPersonaPorId(Guid IdPersona)
        {
            throw new NotImplementedException();
        }
        public Task<Persona?> EliminarPersona(Guid IdPersona)
        {
            throw new NotImplementedException();
        }
        public Task<List<Persona>> GetPersonasByEmpresaId(Guid IdEmpresa)
        {
            throw new NotImplementedException();
        }
        public Task<Persona?> BuscarPersonaPorDni(string Dni)
        {
            throw new NotImplementedException();
        }
    }
}
