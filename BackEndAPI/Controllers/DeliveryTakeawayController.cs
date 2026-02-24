using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class DeliveryTakeawayController : ControllerBase
    {
        private readonly IDeliveryTakeawayServices _deliveryTakeawayServices;
        public DeliveryTakeawayController(IDeliveryTakeawayServices deliveryTakeawayServices)
        {
            _deliveryTakeawayServices = deliveryTakeawayServices;
        }

        [HttpGet]
        public async Task<IActionResult> GetDeliveryTakeaway()
        {
            try
            {
                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;
                if (IdSucursal == Guid.Empty) throw new Exception("Sucursal no identificada");
                var result = await _deliveryTakeawayServices.GetDeliveryTakeaway(IdSucursal);
                if (result == null) throw new Exception("Error al obtener los pedidos");
                return Ok(result);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Error al obtener los pedidos":
                        return BadRequest("Error al obtener los pedidos. Verifica los datos enviados y vuelve a intentarlo.");
                    case "Sucursal no identificada":
                        return BadRequest("Sucursal no identificada. Asegúrate de que el token contenga el claim 'IdSucursal'.");
                    default:
                        return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
        }

        [HttpPost()]
        public async Task<IActionResult> CreateDeliveryTakeaway(CrearDeliveryTakeawayDTO request)
        {
            try
            {
                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;
                if (IdSucursal == Guid.Empty) throw new Exception("Sucursal no identificada");

                var result = await _deliveryTakeawayServices.CrearDeliveryTakeaway(IdSucursal, request);
                if (result == null) throw new Exception("Error al crear el pedido");
                return Ok(result);

            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Error al crear el pedido":
                        return BadRequest("Error al crear el pedido. Verifica los datos enviados y vuelve a intentarlo.");

                    case "Sucursal no identificada":
                        return BadRequest("Sucursal no identificada. Asegúrate de que el token contenga el claim 'IdSucursal'.");

                    default:
                        return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
        }
    }
}
