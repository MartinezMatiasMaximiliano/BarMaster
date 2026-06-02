using Microsoft.AspNetCore.Mvc;
using BackEndAPI.DTOs.Response;
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
            try
            {
                var listaPersonas = await _personasServices.BuscarTodasLasPersonas();

                var response = listaPersonas.Select(persona => new PersonaDTO
                {
                    Id = persona.Id,
                    CodigoDeServicio = persona.CodigoDeServicio,
                    Rol = persona.Rol,
                    IdEmpresa = persona.IdEmpresa,
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
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Empresa no identificada":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "No se encontraron personas para la empresa proporcionada.":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return StatusCode(500, new ErrorDTO(500, "INTERNAL SERVER ERROR", "Ocurrió un error inesperado"));
                }
            }
        }

        [HttpGet("/Persona")]
        public async Task<IActionResult> GetPersonaPorId([FromQuery] Guid Id)
        {
            try
            {
                var persona = await _personasServices.BuscarPersonaPorId(Id);
                if (persona == null)
                {
                    throw new Exception("Persona no identificada");
                }

                PersonaDTO response = new PersonaDTO
                {
                    Id = persona.Id,
                    CodigoDeServicio = persona.CodigoDeServicio,
                    Rol = persona.Rol,
                    IdEmpresa = persona.IdEmpresa,
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
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Persona no identificada":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "No se encontró una persona con el DNI proporcionado.":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return StatusCode(500, new ErrorDTO(500, "INTERNAL SERVER ERROR", "Ocurrió un error inesperado"));
                }

            }
        }

        [HttpPost("/Registrar")]
        public async Task<IActionResult> RegistrarPersona(CrearPersonaDTO request)
        {
            try
            {
                if (request == null || request.IdRol == 0 || string.IsNullOrEmpty(request.Nombres) || string.IsNullOrEmpty(request.Apellido) || string.IsNullOrEmpty(request.Dni) || string.IsNullOrEmpty(request.Direccion) || string.IsNullOrEmpty(request.Telefono) || string.IsNullOrEmpty(request.Email)) throw new Exception("Dato de persona no proporcionados");

                var IdEmpresa = User.Claims.FirstOrDefault(c => c.Type == "IdEmpresa") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdEmpresa")!.Value) : Guid.Empty;
                if (IdEmpresa == Guid.Empty) throw new Exception("Empresa no identificada");

                var usuario = await _personasServices.CrearPersona(request, IdEmpresa);
                return Created("created", new EntregaDTO(201, "CREATED", $"Creado exitosamente, Id:{usuario.Id}"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Dato de persona no proporcionados":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "Empresa no identificada":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "Ya existe una persona con el mismo DNI.":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "No se pudo crear la persona":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "No se pudo Encontrar un Rol de Mozos":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "No se pudo Encontrar un Rol con Id":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return StatusCode(500, new ErrorDTO(500, "INTERNAL SERVER ERROR", "Ocurrió un error inesperado"));
                }
            }
        }

        [HttpPut("/Modificar")]
        public async Task<IActionResult> ModificarPersona(ModificarPersonaDTO DTO)
        {
            try
            {
                var actualizado = await _personasServices.ActualizarPersona(DTO);
                return Ok(new EntregaDTO(200, "OK", $"Modificado exitosamente, Id:{DTO.Id}"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Persona no identificada":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "Ya existe una persona con el mismo código de servicio.":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return StatusCode(500, new ErrorDTO(500, "INTERNAL SERVER ERROR", "Ocurrió un error inesperado"));

                }
            }
        }

        [HttpPut("/activarDesactivar/{Id}")]
        public async Task<IActionResult> ActivarDesactivarPersona(Guid Id)
        {
            try
            {
                var actualizado = await _personasServices.CambiarEstado(Id);
                return Ok(new EntregaDTO(200, "OK", $"Modificado exitosamente, Id:{Id}"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Persona no identificada":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return StatusCode(500, new ErrorDTO(500, "INTERNAL SERVER ERROR", "Ocurrió un error inesperado"));
                }
            }
        }

        [HttpDelete("/Eliminar/{Id}")]
        public async Task<IActionResult> EliminarPersona(Guid Id)
        {
            try
            {
                var eliminado = await _personasServices.EliminarPersona(Id);
                return Ok(new EntregaDTO(200, "OK", $"Eliminado exitosamente, Id:{Id}"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Persona no identificada":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return StatusCode(500, new ErrorDTO(500, "INTERNAL SERVER ERROR", "Ocurrió un error inesperado"));
                }
            }
        }

        [HttpGet("/Mozos")]
        public async Task<IActionResult> GetMozos()
        {
            try
            {
                var mozos = await _personasServices.BuscarMozos();

                var response = mozos.Select(persona => new PersonaDTO
                {
                    Id = persona.Id,
                    CodigoDeServicio = persona.CodigoDeServicio,
                    Rol = persona.Rol,
                    IdEmpresa = persona.IdEmpresa,
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
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "No se encontraron mozos.":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return StatusCode(500, new ErrorDTO(500, "INTERNAL SERVER ERROR", "Ocurrió un error inesperado"));
                }
            }
        }
    }
}


