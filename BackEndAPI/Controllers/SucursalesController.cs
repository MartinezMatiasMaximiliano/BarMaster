using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Exceptions;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class SucursalesController : ControllerBase
    {
        private readonly ISucursalesServices _sucursalesServices;
        private readonly JWTServices _jWTServices;

        public SucursalesController(ISucursalesServices sucursalesServices, JWTServices jWTServices)
        {
            _sucursalesServices = sucursalesServices;
            _jWTServices = jWTServices;
        }
        [HttpGet("/Sucursal")]
        public async Task<IActionResult> BuscarSucursal()
        {
            var idSucursal = ObtenerIdSucursal();
            var sucursal = await _sucursalesServices.BuscarSucursalPorId(idSucursal);

            // Mapear a DTO para evitar referencias circulares
            var response = new SucursalDTO
            {
                Id = sucursal!.Id,
                IdEmpresa = sucursal.IdEmpresa,
                Nombre = sucursal.Nombre,
                Direccion = sucursal.Direccion,
                Telefono = sucursal.Telefono,
                Username = sucursal.Username,
                Menus = sucursal.Menus?.Select(m => new MenuDTO
                {
                    Id = m.Id,
                    IdSucursal = m.IdSucursal,
                    Nombre = m.Nombre,
                    Activo = m.Activo
                }).ToList(),
                Planos = sucursal.Planos?.Select(p => new PlanoDTO
                {
                    Id = p.Id,
                    IdSucursal = p.IdSucursal,
                    Nombre = p.Nombre,
                    Detalles = p.Detalles
                }).ToList(),
                Cajas = sucursal.Cajas?.Select(c => new CajaDTO
                {
                    Id = c.Id,
                    IdSucursal = c.IdSucursal,
                    FechaApertura = c.FechaApertura,
                    FechaCierre = c.FechaCierre,
                    MontoApertura = c.MontoApertura,
                    MontoActual = c.MontoActual,
                    MontoCierre = c.MontoCierre,
                    Diferencia = c.Diferencia
                }).ToList()
            };

            return Ok(response);
        }

        [HttpPost("/Sucursal")]
        public async Task<IActionResult> CrearSucursal([FromBody] CrearSucursalDTO request)
        {
            var idEmpresa = ObtenerIdEmpresa();
            var result = await _sucursalesServices.CrearSucursal(request, idEmpresa);
            return Ok(result);
        }

        [HttpPatch("/Sucursal")]
        public async Task<IActionResult> EditarSucursal([FromBody] ModificarSucursalDTO request)
        {
            var idSucursal = ObtenerIdSucursal();
            var result = await _sucursalesServices.ActualizarSucursal(idSucursal, request);
            return Ok(result);
        }

        private Guid ObtenerIdSucursal()
        {
            var claim = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")?.Value;
            if (!Guid.TryParse(claim, out var idSucursal) || idSucursal == Guid.Empty)
                throw new BusinessRuleException("Sucursal no identificada");
            return idSucursal;
        }

        private Guid ObtenerIdEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(c => c.Type == "IdEmpresa")?.Value;
            if (!Guid.TryParse(claim, out var idEmpresa) || idEmpresa == Guid.Empty)
                throw new BusinessRuleException("Empresa no identificada");
            return idEmpresa;
        }
    }
}
