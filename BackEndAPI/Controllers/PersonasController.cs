using Microsoft.AspNetCore.Mvc;
using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Services.Interfaces;


namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class PersonasController : ControllerBase
    {
        private readonly IPersonasServices _personasServices;
        public PersonasController(IPersonasServices personasServices)
        {
            _personasServices = personasServices;
        }

        // Endpoint para registrar usuarios
        [HttpPost("/Registrar")]
        public async Task<IActionResult> Post(CrearPersonaDTO DTO)
        {
            try
            {
                var IdEmpresa = User.Claims.FirstOrDefault(c => c.Type == "IdEmpresa") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdEmpresa")!.Value) : Guid.Empty;
                if (IdEmpresa == Guid.Empty)
                {
                    throw new Exception("Empresa no identificada");
                }

                var usuario = await _personasServices.CrearPersona(DTO, IdEmpresa);
                return Created("created", new EntregaDTO(201, "CREATED", $"Creado exitosamente, Id:{usuario.Id}"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
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
    }
}


