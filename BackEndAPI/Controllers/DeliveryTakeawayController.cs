using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("/[controller]")]
    [ApiController]
    public class DeliveryTakeawayController : ControllerBase
    {
        private readonly IDeliveryTakeawayServices _deliveryTakeawayServices;
        public DeliveryTakeawayController(IDeliveryTakeawayServices deliveryTakeawayServices)
        {
            _deliveryTakeawayServices = deliveryTakeawayServices;
        }

        private static DeliveryTakeawayResponseDTO MappearDeliveryTakeawayDTO(DeliveryAndTakeaway deliveryTakeaway)
        {
            return new DeliveryTakeawayResponseDTO
            {
                Id = deliveryTakeaway.Id,
                IdSucursal = deliveryTakeaway.IdSucursal,
                IdTipoEnvio = deliveryTakeaway.IdTipoEnvio,
                IdVisita = deliveryTakeaway.IdVisita,
                IdCaja = deliveryTakeaway.Visita.IdCaja,
                FechaHora = deliveryTakeaway.FechaHora,
                NombreCliente = deliveryTakeaway.NombreCliente ?? "",
                Direccion = deliveryTakeaway.Direccion,
                Indicaciones = deliveryTakeaway.Indicaciones,
                Telefono = deliveryTakeaway.Telefono ?? "",
                PrecioTotal = deliveryTakeaway.PrecioTotal,
                PrecioEnvio = deliveryTakeaway.TipoEnvio != null ? deliveryTakeaway.TipoEnvio.Precio : 0,
                Entregado = deliveryTakeaway.Entregado,
                Cadete = deliveryTakeaway.Cadete != null ? new CadeteDTO
                {
                    Id = deliveryTakeaway.Cadete.Id,
                    Nombre = deliveryTakeaway.Cadete.Nombres,
                    Apellido = deliveryTakeaway.Cadete.Apellido,
                    Telefono = deliveryTakeaway.Cadete.Telefono,
                } : null,
                Productos = (deliveryTakeaway.Visita?.Productos ?? new List<ProductosPorVisita>()).Select(p => new ItemDTO
                {
                    Id = p.Id,
                    IdProducto = p.IdProducto,
                    Nombre = p.NombreProducto,
                    Indicaciones = p.Detalles,
                    Precio = p.PrecioDelMomento,
                    EstadoPagado = p.EstadoPagado,
                    EstadoPedido = p.EstadoPedido,
                    FechaAgregado = p.FechaAgregado,
                }).ToList()
            };
        }

        [HttpGet]
        public async Task<IActionResult> GetListaDeliveryTakeaways()
        {
            try
            {
                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;
                if (IdSucursal == Guid.Empty) throw new Exception("Sucursal no identificada");
                var result = await _deliveryTakeawayServices.GetListaDeliveryTakeaways(IdSucursal);
                if (result == null) throw new Exception("Error al obtener los pedidos");
                var response = result.Select(MappearDeliveryTakeawayDTO).ToList();
                return Ok(response);
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

        [HttpGet("Caja/{idCaja}")]
        public async Task<IActionResult> GetListaDeliveryTakeawaysPorCaja(Guid idCaja)
        {
            try
            {
                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;
                if (IdSucursal == Guid.Empty) throw new Exception("Sucursal no identificada");
                if (idCaja == Guid.Empty) throw new Exception("Caja no identificada");
                var result = await _deliveryTakeawayServices.GetListaDeliveryTakeawaysPorCaja(IdSucursal, idCaja);
                if (result == null) throw new Exception("Error al obtener los pedidos");
                var response = result.Select(MappearDeliveryTakeawayDTO).ToList();
                return Ok(response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Error al obtener los pedidos":
                        return BadRequest("Error al obtener los pedidos. Verifica los datos enviados y vuelve a intentarlo.");
                    case "Sucursal no identificada":
                        return BadRequest("Sucursal no identificada. Asegúrate de que el token contenga el claim 'IdSucursal'.");
                    case "Caja no identificada":
                        return BadRequest("Caja no identificada. Asegúrate de enviar un Id de caja válido.");
                    default:
                        return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDeliveryTakeawayPorId(Guid id)
        {
            var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;
            if (IdSucursal == Guid.Empty) throw new Exception("Sucursal no identificada");
            var result = await _deliveryTakeawayServices.ObtenerDeliveryTakeawayPorId(id);
            if (result == null) throw new Exception("Error al obtener los pedidos");
            var response = MappearDeliveryTakeawayDTO(result);
            return Ok(response);
        }

        [HttpPost("Crear")]
        public async Task<IActionResult> CreateDeliveryTakeaway(CrearDeliveryTakeawayDTO request)
        {
            try
            {
                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;
                if (IdSucursal == Guid.Empty) throw new Exception("Sucursal no identificada");
                if (request.Origen != "Delivery" && request.Origen != "Takeaway") throw new Exception("Origen no válido. El campo 'Origen' debe ser 'Delivery' o 'Takeaway'.");
                var result = await _deliveryTakeawayServices.CrearDeliveryTakeaway(IdSucursal, request);
                if (result == null) throw new Exception("Error al crear el pedido");
                var response = MappearDeliveryTakeawayDTO(result);
                return Ok(response);

            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Cantidad no válida":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", "Cantidad no válida. Asegúrate de enviar una cantidad mayor a cero para cada producto."));
                    case "Producto no encontrado":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", "Uno o más productos no fueron encontrados. Verifica los IDs de los productos enviados y vuelve a intentarlo."));
                    case "Origen no válido. El campo 'Origen' debe ser 'Delivery' o 'Takeaway'.":
                        return BadRequest(new ErrorDTO(400,"BAD REQUEST","Origen no válido. El campo 'Origen' debe ser 'Delivery' o 'Takeaway'."));
                    case "Error al crear el pedido":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST","Error al crear el pedido. Verifica los datos enviados y vuelve a intentarlo."));

                    case "Sucursal no identificada":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST","Sucursal no identificada. Asegúrate de que el token contenga el claim 'IdSucursal'."));

                    default:
                        return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
        }

        [HttpPatch("ModificarDatos")]
        public async Task<IActionResult> ModificarDatosDeliveryTakeaway(ModificarDeliveryTakeawayDTO request)
        {
            try
            {
                if (request.IdDeliveryTakeaway == Guid.Empty) throw new Exception("Id del pedido nulo");
                var result = await _deliveryTakeawayServices.ModificarDatosDeliveryTakeaway(request);
                if (result == null) throw new Exception("Error al modificar el pedido");
                var response = new DeliveryTakeawayResponseDTO
                {
                    Id = result.Id,
                    IdSucursal = result.IdSucursal,
                    IdTipoEnvio = result.IdTipoEnvio,
                    IdVisita = result.IdVisita,
                    IdCaja = result.Visita.IdCaja,
                    FechaHora = result.FechaHora,
                    NombreCliente = result.NombreCliente ?? "",
                    Direccion = result.Direccion,
                    Indicaciones = result.Indicaciones,
                    Telefono = result.Telefono ?? "",
                    PrecioTotal = result.PrecioTotal,
                    Entregado = result.Entregado
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Id del pedido nulo":
                        return BadRequest("Id del pedido nulo. Asegúrate de enviar un Id válido en el campo 'IdDeliveryTakeaway'.");
                    case "Error al modificar el pedido":
                        return BadRequest("Error al modificar el pedido. Verifica los datos enviados y vuelve a intentarlo.");
                    case "Cadete no encontrado":
                        return BadRequest("El cadete enviado no existe.");
                    case "La persona seleccionada no es cadete":
                        return BadRequest("La persona seleccionada no tiene rol de cadete.");
                    case "No hay productos para remover":
                        return BadRequest("No hay productos para remover. Asegúrate de que el pedido tenga productos antes de intentar removerlos.");
                    case "No se pueden modificar pedidos entregados":
                        return BadRequest("No se pueden modificar pedidos entregados. Verifica el estado del pedido antes de intentar modificarlo.");
                    case "No se pueden modificar pedidos cerrados":
                        return BadRequest("No se pueden modificar pedidos cerrados. Verifica el estado del pedido antes de intentar modificarlo.");
                    case "No se pueden modificar pedidos cancelados":
                        return BadRequest("No se pueden modificar pedidos cancelados. Verifica el estado del pedido antes de intentar modificarlo.");
                    default:
                        return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
        }

        [HttpDelete]
        public async Task<IActionResult> EliminarDeliveryTakeaway(Guid id)
        {
            try
            {
                if (id == Guid.Empty) throw new Exception("Id del pedido nulo");
                var result = await _deliveryTakeawayServices.EliminarDeliveryTakeaway(id);
                if (!result) throw new Exception("Error al eliminar el pedido");
                return Ok(new { message = "Pedido eliminado correctamente" });
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Id del pedido nulo":
                        return BadRequest(new ErrorDTO(400,"BAD REQUEST", "Id del pedido nulo. Asegúrate de enviar un Id válido en el campo 'IdDeliveryTakeaway'.") );
                    case "Error al eliminar el pedido":
                        return BadRequest(new ErrorDTO(400,"BAD REQUEST", "Error al eliminar el pedido. Verifica el Id enviado y vuelve a intentarlo."));
                    default:
                        return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
        }
    }
}
