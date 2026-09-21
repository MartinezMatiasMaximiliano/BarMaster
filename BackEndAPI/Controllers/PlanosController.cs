using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Exceptions;
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
            var idSucursal = ObtenerIdSucursal();
            var planoCreado = await _planosServices.CrearPlano(request, idSucursal);
            return Ok(planoCreado);
        }

        [HttpGet("/ListaPlanosSucursal")]
        public async Task<IActionResult> ObtenerPlanosPorSucursal()
        {
            var idSucursal = ObtenerIdSucursal();
            var planos = await _planosServices.BuscarListaDePlanos(idSucursal);

            var response = planos.Select(plano => new PlanosDTO
            {
                Id = plano.Id,
                Nombre = plano.Nombre,
                Detalles = plano.Detalles,
                IdSucursal = plano.IdSucursal,
                Mesas = plano.Mesas.Select(mesa => new MesaDTO
                {
                    Id = mesa.Id,
                    Numero = mesa.Numero,
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

        [HttpGet("/Plano")]
        public async Task<IActionResult> ObtenerPlanoPorId([FromQuery] Guid IdPlano)
        {
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
                    Numero = mesa.Numero,
                    Capacidad = mesa.Capacidad,
                    x = mesa.x,
                    y = mesa.y,
                    w = mesa.w,
                    h = mesa.h
                }).ToList()
            };

            return Ok(response);
        }

        [HttpPut("/Plano")]
        public async Task<IActionResult> ModificarPlano(ModificarPlanoDTO request)
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

        [HttpDelete("/Plano")]
        public async Task<IActionResult> EliminarPlano([FromQuery] Guid IdPlano)
        {
            await _planosServices.EliminarPlano(IdPlano);
            return Ok(new EntregaDTO(200, "DELETED", "Plano eliminado exitosamente"));
        }

        private Guid ObtenerIdSucursal()
        {
            var claim = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")?.Value;
            if (!Guid.TryParse(claim, out var idSucursal) || idSucursal == Guid.Empty)
                throw new BusinessRuleException("Sucursal no identificada");
            return idSucursal;
        }
    }
}
