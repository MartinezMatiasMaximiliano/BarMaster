using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class StockController : ControllerBase
    {
        private readonly IStockServices _stockServices;

        public StockController(IStockServices stockServices)
        {
            _stockServices = stockServices;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerStock()
        {
            var idSucursal = ObtenerIdSucursal();
            return Ok(await _stockServices.ObtenerStockAsync(idSucursal));
        }

        [HttpGet("movimientos/{idProducto:guid}")]
        public async Task<IActionResult> ObtenerMovimientos(Guid idProducto)
        {
            var idSucursal = ObtenerIdSucursal();
            return Ok(await _stockServices.ObtenerMovimientosAsync(idProducto, idSucursal));
        }

        [HttpPut("{idProducto:guid}")]
        public async Task<IActionResult> Configurar(Guid idProducto, ConfigurarStockDTO request)
        {
            var idSucursal = ObtenerIdSucursal();
            return Ok(await _stockServices.ConfigurarAsync(idProducto, idSucursal, request));
        }

        [HttpPut("movimientos/{idProducto:guid}")]
        public async Task<IActionResult> RegistrarMovimiento(Guid idProducto, RegistrarMovimientoStockDTO request)
        {
            var idSucursal = ObtenerIdSucursal();
            return Ok(await _stockServices.RegistrarMovimientoAsync(idProducto, idSucursal, request));
        }

        private Guid ObtenerIdSucursal()
        {
            var claim = User.Claims.FirstOrDefault(x => x.Type == "IdSucursal")?.Value;
            if (!Guid.TryParse(claim, out var idSucursal)) throw new Exception("Sucursal no identificada");
            return idSucursal;
        }
    }
}
