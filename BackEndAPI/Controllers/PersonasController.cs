using Microsoft.AspNetCore.Mvc;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Exceptions;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;


namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class PersonasController : ControllerBase
    {
        private readonly IPersonasServices _personasServices;
        public PersonasController(IPersonasServices personasServices)
        {
            _personasServices = personasServices;
        }

        [HttpGet("/ListaEmpleados")]
        public async Task<IActionResult> GetListaPersonasDeEmpresa()
        {
            var listaPersonas = await _personasServices.BuscarTodasLasPersonas();

            var response = listaPersonas.Select(persona => new PersonaDTO
            {
                Id = persona.Id,
                CodigoDeServicio = persona.CodigoDeServicio,
                Rol = persona.Rol,
                IdEmpresa = persona.IdEmpresa,
                PersonajeId = persona.PersonajeId,
                DatosPersonales = new DatosPersonales
                {
                    Nombres = persona.Nombres,
                    Apellido = persona.Apellido,
                    Dni = persona.Dni,
                    Direccion = persona.Direccion,
                    Telefono = persona.Telefono,
                    Email = persona.Email,
                    Activo = persona.Activo,
                }
            }).ToList();

            return Ok(response);
        }

        [HttpGet("/Persona")]
        public async Task<IActionResult> GetPersonaPorId([FromQuery] Guid Id)
        {
            var persona = await _personasServices.BuscarPersonaPorId(Id);

            var response = new PersonaDTO
            {
                Id = persona!.Id,
                CodigoDeServicio = persona.CodigoDeServicio,
                Rol = persona.Rol,
                IdEmpresa = persona.IdEmpresa,
                PersonajeId = persona.PersonajeId,
                DatosPersonales = new DatosPersonales
                {
                    Nombres = persona.Nombres,
                    Apellido = persona.Apellido,
                    Dni = persona.Dni,
                    Direccion = persona.Direccion,
                    Telefono = persona.Telefono,
                    Email = persona.Email,
                    Activo = persona.Activo,
                }
            };
            return Ok(response);
        }

        [HttpPost("/Registrar")]
        public async Task<IActionResult> RegistrarPersona(CrearPersonaDTO request)
        {
            if (request == null
                || request.IdRol == 0
                || string.IsNullOrEmpty(request.Nombres)
                || string.IsNullOrEmpty(request.Apellido))
                throw new BusinessRuleException("Dato de persona no proporcionados");

            var claimIdEmpresa = User.Claims.FirstOrDefault(c => c.Type == "IdEmpresa")?.Value;
            if (!Guid.TryParse(claimIdEmpresa, out var idEmpresa) || idEmpresa == Guid.Empty)
                throw new BusinessRuleException("Empresa no identificada");

            var usuario = await _personasServices.CrearPersona(request, idEmpresa);
            return Created("created", new EntregaDTO(201, "CREATED", $"Creado exitosamente, Id:{usuario!.Id}"));
        }

        [HttpPut("/Modificar")]
        public async Task<IActionResult> ModificarPersona(ModificarPersonaDTO DTO)
        {
            await _personasServices.ActualizarPersona(DTO);
            return Ok(new EntregaDTO(200, "OK", $"Modificado exitosamente, Id:{DTO.Id}"));
        }

        [HttpPut("/activarDesactivar/{Id}")]
        public async Task<IActionResult> ActivarDesactivarPersona(Guid Id)
        {
            await _personasServices.CambiarEstado(Id);
            return Ok(new EntregaDTO(200, "OK", $"Modificado exitosamente, Id:{Id}"));
        }

        [HttpPut("/Persona/Personaje")]
        public async Task<IActionResult> ModificarPersonaje([FromBody] ModificarPersonajeDTO request)
        {
            if (request.IdPersona == Guid.Empty)
                throw new BusinessRuleException("El idPersona es obligatorio");

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var persona = await _personasServices.ActualizarPersonaje(request.IdPersona, request.PersonajeId);
            return Ok(new { idPersona = persona!.Id, personajeId = persona.PersonajeId });
        }

        [HttpDelete("/Eliminar/{Id}")]
        public async Task<IActionResult> EliminarPersona(Guid Id)
        {
            await _personasServices.EliminarPersona(Id);
            return Ok(new EntregaDTO(200, "OK", $"Eliminado exitosamente, Id:{Id}"));
        }

        [HttpGet("/Mozos")]
        public async Task<IActionResult> GetMozos()
        {
            var mozos = await _personasServices.BuscarMozos();

            var response = mozos.Select(persona => new PersonaDTO
            {
                Id = persona.Id,
                CodigoDeServicio = persona.CodigoDeServicio,
                Rol = persona.Rol,
                IdEmpresa = persona.IdEmpresa,
                PersonajeId = persona.PersonajeId,
                DatosPersonales = new DatosPersonales
                {
                    Nombres = persona.Nombres,
                    Apellido = persona.Apellido,
                    Dni = persona.Dni,
                    Direccion = persona.Direccion,
                    Telefono = persona.Telefono,
                    Email = persona.Email,
                    Activo = persona.Activo,
                }
            }).ToList();

            return Ok(response);
        }
    }
}
