using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class EmpresasController : ControllerBase
    {
        private readonly IEmpresasServices _empresasServices;
        public EmpresasController(IEmpresasServices empresasServices)
        {
            _empresasServices = empresasServices;
        }

        [Authorize]
        [HttpGet("/Empresa/Plan")]
        public async Task<IActionResult> ObtenerPlan()
        {
            if (!Guid.TryParse(User.FindFirst("IdEmpresa")?.Value, out var idEmpresa) || idEmpresa == Guid.Empty)
                return Unauthorized(new ErrorDTO(401, "UNAUTHORIZED", "Token inválido"));
            var empresa = await _empresasServices.GetEmpresaById(idEmpresa);
            if (empresa == null) return NotFound(new ErrorDTO(404, "NOT FOUND", "Empresa no encontrada"));
            var plan = empresa.TipoSubscripcion;
            if (plan == null) return NoContent();
            return Ok(new PlanEmpresaDTO(plan.Id, plan.Nombre, plan.Precio, plan.Features ?? []));
        }

        [Authorize]
        [HttpGet("/Empresa")]
        public async Task<IActionResult> ObtenerEmpresaConSucursales()
        {
            var idClaim = User.Claims.FirstOrDefault(c => c.Type == "IdEmpresa");
            if (idClaim == null)
                return Unauthorized(new ErrorDTO(401, "UNAUTHORIZED", "Token inválido"));

            var idEmpresa = Guid.Parse(idClaim.Value);
            var empresa = await _empresasServices.GetEmpresaById(idEmpresa);

            if (empresa == null)
                return NotFound(new ErrorDTO(404, "NOT FOUND", "Empresa no encontrada"));

            var response = new EmpresaConSucursalesDTO
            {
                Id = empresa.Id,
                Nombre = empresa.Nombre,
                Telefonos = empresa.Telefonos,
                Emails = empresa.Emails,
                Activo = empresa.Activo,
                FechaInscripcion = empresa.FechaInscripcion,
                Sucursales = empresa.Sucursales?.Select(s => new SucursalSimpleDTO
                {
                    Id = s.Id,
                    Nombre = s.Nombre,
                    Direccion = s.Direccion,
                    Telefono = s.Telefono,
                    Username = s.Username
                }).ToList() ?? []
            };

            return Ok(response);
        }

        [Authorize]
        [HttpGet("/Empresa/Sucursales/Resumen")]
        public async Task<IActionResult> ObtenerResumenSucursales([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta)
        {
            var idClaim = User.Claims.FirstOrDefault(c => c.Type == "IdEmpresa");
            if (idClaim == null)
                return Unauthorized(new ErrorDTO(401, "UNAUTHORIZED", "Token inválido"));

            var idEmpresa = Guid.Parse(idClaim.Value);
            var fechaHasta = hasta ?? DateTime.UtcNow;
            var fechaDesde = desde ?? fechaHasta.AddDays(-7);
            var resumen = await _empresasServices.GetResumenSucursales(idEmpresa, fechaDesde, fechaHasta);

            if (resumen == null)
                return NotFound(new ErrorDTO(404, "NOT FOUND", "Empresa no encontrada"));

            return Ok(resumen);
        }
        [HttpPost()]
        public async Task<IActionResult> CrearEmpresa([FromBody] CrearEmpresaDTO request)
        {
            var result = await _empresasServices.AddEmpresa(request);

            EmpresaDTO response = new()
            {
                Id = result.Id,
                Nombre = result.Nombre,
                Telefonos = result.Telefonos,
                Emails = result.Emails,
                Activo = result.Activo,
                FechaInscripcion = result.FechaInscripcion
            };
            return Ok(response);
        }

        //TODO
        [HttpPatch("/Empresa")]
        public async Task<IActionResult> ModificarEmpresa([FromBody] ModificarEmpresaDTO request)
        {
            return Ok();
        }

        //TODO
        [HttpPatch("/ActivarDesactivar")]
        public async Task<IActionResult> CambiarEstadoEmpresa([FromQuery] Guid IdEmpresa)
        {
            return Ok(IdEmpresa);
        }
    }
}
