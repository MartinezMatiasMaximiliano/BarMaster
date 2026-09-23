using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Exceptions;
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
                throw new ConflictException("Ya existe una persona con el mismo DNI.");
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
        public async Task<Persona?> BuscarPersonaPorId(Guid IdPersona)
        {
            // OJO: antes esto comparaba la Task devuelta por el repositorio contra null (siempre
            // false, nunca es null) en vez de esperar el resultado — el throw de "no encontrada"
            // nunca se disparaba y un null se colaba hasta el controller. Con el await se compara
            // el resultado real.
            var persona = await _personasRepository.GetPersonaPorId(IdPersona);
            if (persona == null)
            {
                throw new NotFoundException("No se encontró una persona con el IdPersona proporcionado.");
            }
            return persona;
        }
        public async Task<Persona?> BuscarPersonaPorDni(string Dni)
        {
            var persona = await _personasRepository.GetPersonaPorDni(Dni);
            if (persona == null)
            {
                throw new NotFoundException("No se encontró una persona con el DNI proporcionado.");
            }
            return persona;
        }
        public async Task<ICollection<Persona>> BuscarTodasLasPersonas()
        {
            var busqueda = await _personasRepository.GetAllPersonas();
            if (busqueda == null || busqueda.Count == 0)
            {
                throw new NotFoundException("No se encontraron personas para la empresa proporcionada.");
            }
            return busqueda;
        }
        public async Task<Persona?> ActualizarPersona(ModificarPersonaDTO personaActualizada)
        {
            var persona =  await _personasRepository.GetPersonaPorId(personaActualizada.Id);
            if (persona == null)
            {
                throw new NotFoundException("Persona no identificada");
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
                    throw new ConflictException("Ya existe una persona con el mismo código de servicio.");
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
                throw new BusinessRuleException("El personaje seleccionado no es válido.");
            }

            var persona = await _personasRepository.GetPersonaPorId(idPersona);
            if (persona == null)
            {
                throw new NotFoundException("Persona no identificada");
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
                throw new NotFoundException("Persona no identificada");
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
                throw new NotFoundException("Persona no identificada");
            }
            return await _personasRepository.EliminarPersona(persona);
        }
        public async Task<ICollection<Persona>> BuscarMozos()
        {
            var mozos = await _personasRepository.GetPersonasPorIdRol(Roles.Mozo);
            if (mozos == null || mozos.Count == 0)
            {
                throw new NotFoundException("No se encontraron mozos.");
            }
            return mozos;
        }

        public Task<ICollection<Persona>> BuscarPersonasPorRol(int idRol) =>
            _personasRepository.GetPersonasPorIdRol(idRol);

        public async Task<Persona?> ValidarCodigoMozo(string codigo)
        {
            var persona = await _personasRepository.GetPersonaPorCodigoDeServicio(codigo);
            return persona is { Activo: true }
                && persona.IdRol == Roles.Mozo
                    ? persona
                    : null;
        }
    }
}
