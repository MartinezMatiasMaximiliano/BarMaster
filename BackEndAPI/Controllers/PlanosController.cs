using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PlanosController : ControllerBase
    {
        private readonly IPlanosServices _planosServices;

        public PlanosController(IPlanosServices planosServices)
        {
            _planosServices = planosServices;
        }

        [HttpPost("/Plano")]
        public async Task<IActionResult> CrearPlano([FromBody] CrearPlanoDTO request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Nombre))
                {
                    throw new Exception("El nombre del plano es obligatorio");
                }
                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;

                if (IdSucursal == Guid.Empty)
                {
                    throw new Exception("Sucursal no identificada");
                }

                var PlanoCreado = await _planosServices.CrearPlano(request, IdSucursal);


                return Ok(PlanoCreado);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Sucursal no identificada":
                        return BadRequest("Sucursal no identificada");
                    case "Plano ya existe":
                        return BadRequest("Plano ya existe");
                    case "El nombre del plano es obligatorio":
                        return BadRequest("El nombre del plano es obligatorio");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }

        [HttpGet("/ListaPlanosSucursal")]
        public async Task<IActionResult> ObtenerPlanosPorSucursal()
        {
            try
            {
                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;
                var planos = await _planosServices.BuscarListaDePlanos(IdSucursal);

                var response = planos.Select(plano => new PlanosDTO
                {
                    Id = plano.Id,
                    Nombre = plano.Nombre,
                    Detalles = plano.Detalles,
                    IdSucursal = plano.IdSucursal,
                    Mesas = plano.Mesas.Select(mesa => new MesaDTO
                    {
                        Id = mesa.Id,
                        Nombre = mesa.Nombre,
                        Capacidad = mesa.Capacidad,
                        CodigoParaPedir = mesa.CodigoParaPedir,
                        x = mesa.x,
                        y = mesa.y,
                        w = mesa.w,
                        h = mesa.h
                    }).ToList()
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Sucursal no identificada":
                        return BadRequest("Sucursal no identificada");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }

        [HttpGet("/Plano")]
        public async Task<IActionResult> ObtenerPlanoPorId([FromQuery] Guid IdPlano)
        {
            try
            {
                if (IdPlano == Guid.Empty)
                {
                    throw new Exception("IdPlano no puede estar vacío");
                }

                var plano = await _planosServices.ObtenerPlanoPorId(IdPlano);

                var response = new PlanosDTO
                {
                    Id = plano.Id,
                    Nombre = plano.Nombre,
                    Detalles = plano.Detalles,
                    IdSucursal = plano.IdSucursal,
                    Mesas = plano.Mesas.Select(mesa => new MesaDTO
                    {
                        Id = mesa.Id,
                        Nombre = mesa.Nombre,
                        Capacidad = mesa.Capacidad,
                        x = mesa.x,
                        y = mesa.y,
                        w = mesa.w,
                        h = mesa.h
                    }).ToList()
                };

                return Ok(plano);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Plano no encontrado":
                        return NotFound("Plano no encontrado");
                    case "IdPlano no puede estar vacío":
                        return NotFound("IdPlano no puede estar vacío");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }

            }
        }

        [HttpPut("/Plano")]
        public async Task<IActionResult> ModificarPlano(ModificarPlanoDTO request)
        {
            try
            {
                var planoModificado = await _planosServices.ActualizarPlano(request);
                
                // Mapear a DTO para evitar ciclos de referencia en la serialización
                var response = new PlanoDTO
                {
                    Id = planoModificado.Id,
                    Nombre = planoModificado.Nombre,
                    Detalles = planoModificado.Detalles,
                    IdSucursal = planoModificado.IdSucursal
                };
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Plano no encontrado":
                        return NotFound("Plano no encontrado");
                    case "Plano ya existe":
                        return BadRequest("Plano ya existe");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }

        [HttpDelete("/Plano")]
        public async Task<IActionResult> EliminarPlano([FromQuery] Guid IdPlano)
        {
            try
            {
                var resultado = await _planosServices.EliminarPlano(IdPlano);
                
                return Ok(new EntregaDTO(200,"DELETED","Plano eliminado exitosamente"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Plano no encontrado":
                        return NotFound("Plano no encontrado");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }


    }
}
