using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Exceptions;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class CajasController : ControllerBase
    {
        private readonly ICajasServices _cajasServices;
        public CajasController(ICajasServices cajasServices)
        {
            _cajasServices = cajasServices;
        }

        [HttpGet("/Cajas")]
        [Authorize(Policy = "SoloAdmin")]
        public async Task<IActionResult> GetListaCajas()
        {
            var cajas = await _cajasServices.BuscarListaCajas();
            return Ok(cajas.Select(MapearCaja).ToList());
        }

        [HttpGet("/Cajas/Activa")]
        public async Task<IActionResult> GetCajaActiva()
        {
            var idSucursal = ObtenerIdSucursal();
            var caja = await _cajasServices.BuscarCajaAbiertaPorIdSucursal(idSucursal);

            if (caja == null)
                throw new NotFoundException("No hay una caja abierta");

            return Ok(MapearCaja(caja));
        }

        [HttpGet("/Cajas/{id}")]
        public async Task<IActionResult> GetCajaPorId(Guid id)
        {
            var caja = await _cajasServices.BuscarCajaPorId(id);
            return Ok(MapearCaja(caja));
        }

        [HttpPost("/Cajas/Abrir")]
        public async Task<IActionResult> AbrirCaja([FromBody] CrearCajaDTO request)
        {
            var idSucursal = ObtenerIdSucursal();
            var caja = await _cajasServices.CrearCaja(request, idSucursal);
            return Ok(MapearCaja(caja));
        }

        [HttpPatch("/Cajas/Cerrar")]
        public async Task<IActionResult> CerrarCaja([FromBody] CerrarCajaDTO request)
        {
            var caja = await _cajasServices.CerrarCaja(request.IdCaja, request.MontoCierre);
            return Ok(MapearCaja(caja));
        }

        private Guid ObtenerIdSucursal()
        {
            var claim = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")?.Value;
            if (!Guid.TryParse(claim, out var idSucursal) || idSucursal == Guid.Empty)
                throw new BusinessRuleException("Sucursal no identificada");
            return idSucursal;
        }

        private static CajaDTO MapearCaja(Caja caja) => new CajaDTO
        {
            Id = caja.Id,
            IdSucursal = caja.IdSucursal,
            FechaApertura = caja.FechaApertura,
            FechaCierre = caja.FechaCierre,
            MontoApertura = caja.MontoApertura,
            MontoActual = caja.MontoActual,
            MontoCierre = caja.MontoCierre,
            Diferencia = caja.Diferencia
        };
    }
}
