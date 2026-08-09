using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;
using Humanizer;
using NuGet.Versioning;
using System.Net;

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
            if (existente != null) {
                throw new Exception("Ya existe una persona con el mismo DNI.");
            }

            var usuario = new Persona
            {
                IdRol = nuevaPersona.IdRol,
                IdEmpresa = IdEmpresa,
                IdSucursal = null,
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
            while (!await _personasRepository.EsCodigoUnico(PINUnico));

            usuario.CodigoDeServicio = PINUnico;
            await _personasRepository.CrearPersona(usuario);
            return usuario;
        }
        public Task<Persona?> BuscarPersonaPorId(Guid IdPersona)
        {
            var busqueda = _personasRepository.GetPersonaPorId(IdPersona);
            if (busqueda == null)
            {
                throw new Exception("No se encontró una persona con el IdPersona proporcionado.");
            }
            return busqueda;
        }
        public Task<Persona?> BuscarPersonaPorDni(string Dni)
        {
            var busqueda = _personasRepository.GetPersonaPorDni(Dni);
            if (busqueda == null)
            {
                throw new Exception("No se encontró una persona con el DNI proporcionado.");
            }
            return busqueda;
        }
        public async Task<ICollection<Persona>> BuscarTodasLasPersonas()
        {
            var busqueda = await _personasRepository.GetAllPersonas();
            if (busqueda == null || busqueda.Count == 0)
            {
                throw new Exception("No se encontraron personas para la empresa proporcionada.");
            }
            return busqueda;
        }
        public async Task<Persona?> ActualizarPersona(ModificarPersonaDTO personaActualizada)
        {
            var persona =  await _personasRepository.GetPersonaPorId(personaActualizada.Id);
            if (persona == null)
            {
                throw new Exception("Persona no identificada");
            }

            persona.Nombres = !string.IsNullOrEmpty(personaActualizada.Nombres) ? personaActualizada.Nombres : persona.Nombres;
            persona.Apellido = !string.IsNullOrEmpty(personaActualizada.Apellido) ? personaActualizada.Apellido : persona.Apellido;
            persona.Dni = !string.IsNullOrEmpty(personaActualizada.Dni) ? personaActualizada.Dni : persona.Dni;
            persona.Direccion = !string.IsNullOrEmpty(personaActualizada.Direccion) ? personaActualizada.Direccion : persona.Direccion;
            persona.Telefono = !string.IsNullOrEmpty(personaActualizada.Telefono) ? personaActualizada.Telefono : persona.Telefono;
            persona.Email = !string.IsNullOrEmpty(personaActualizada.Email) ? personaActualizada.Email : persona.Email;
            persona.IdRol = personaActualizada.IdRol;

            if (!string.IsNullOrEmpty(personaActualizada.CodigoDeServicio) &&
                personaActualizada.CodigoDeServicio != persona.CodigoDeServicio)
            {
                var personaConCodigo = await _personasRepository.GetPersonaPorCodigoDeServicio(personaActualizada.CodigoDeServicio);
                if (personaConCodigo != null && personaConCodigo.Id != personaActualizada.Id)
                {
                    throw new Exception("Ya existe una persona con el mismo código de servicio.");
                }

                persona.CodigoDeServicio = personaActualizada.CodigoDeServicio;
            }
            
            await _personasRepository.ActualizarPersona(persona);
            return persona;
        }
        public async Task<Persona?> ActualizarPersonaje(Guid idPersona, int personajeId)
        {
            if (personajeId < 0 || personajeId > 9)
            {
                throw new ArgumentOutOfRangeException(nameof(personajeId), "El personaje seleccionado no es válido.");
            }

            var persona = await _personasRepository.GetPersonaPorId(idPersona);
            if (persona == null)
            {
                throw new Exception("Persona no identificada");
            }

            persona.PersonajeId = personajeId;
            await _personasRepository.ActualizarPersona(persona);
            return persona;
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
        public async Task<Persona?> EliminarPersona(Guid IdPersona)
        {
            var persona =  await _personasRepository.GetPersonaPorId(IdPersona);
            if (persona == null)
            {
                throw new Exception("Persona no identificada");
            }
            return await _personasRepository.EliminarPersona(persona);
        }
        public async Task<ICollection<Persona>> BuscarMozos()
        {
            var mozos = await _personasRepository.GetPersonasPorNombreRol("Mozo");
            if (mozos == null || mozos.Count == 0)
            {
                throw new Exception("No se encontraron mozos.");
            }
            return mozos;
        }
    }
}
