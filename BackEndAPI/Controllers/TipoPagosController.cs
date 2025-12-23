using BackEndAPI.Services.Interfaces;
using BackEndAPI.DTOs.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEndAPI.Models;
namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class TipoPagosController : ControllerBase
    {
        private readonly ITipoPagosServices _TipoPagosServices;
           
        public TipoPagosController(ITipoPagosServices tipoPagosServices)
        {
            _TipoPagosServices = tipoPagosServices;
        }

        [HttpGet("/TipoPagos")]
        public async Task<IActionResult> GetTipoPagos()
        {
            try
            {
                var tipoPagos = await _TipoPagosServices.BuscarTipoPagos();
                var listaTipoPagos = tipoPagos.ToList();
                return Ok(listaTipoPagos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error Interno de servidor: " + ex.Message);
            }
        }

        [HttpGet("/TipoPagos/{id}")]
        public async Task<IActionResult> GetTipoPagoPorId(int id) {
            try {
                var tipoPago = await _TipoPagosServices.BuscarTipoPagoPorId(id);
                return Ok(tipoPago);
            }
            catch (Exception ex) {
                switch (ex.Message) {
                    case "Tipo de pago no encontrado":
                        return NotFound(ex.Message);
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }

        [HttpPost("/TipoPagos")]
        public async Task<IActionResult> CrearTipoPago([FromBody] string nombre) {
            try {
                var nuevoTipoPago = await _TipoPagosServices.CrearTipoPago(nombre);
                return Ok(nuevoTipoPago);
            }
            catch (Exception ex) {
                return StatusCode(500, "Error Interno de servidor: " + ex.Message);
            }
        }

        [HttpDelete("/TipoPagos/{id}")]
        public async Task<IActionResult> EliminarTipoPago(int id) {
            try {
                var tipoPagoEliminado = await _TipoPagosServices.EliminarTipoPago(id);
                return Ok(new EntregaDTO(200,"DELETED","Tipo de pago eliminado exitosamente"));
            }
            catch (Exception ex) {
                return StatusCode(500, "Error Interno de servidor: " + ex.Message);
            }
        }
    }
}