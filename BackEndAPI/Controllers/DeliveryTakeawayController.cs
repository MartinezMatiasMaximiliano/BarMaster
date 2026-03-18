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

        [HttpGet]
        public async Task<IActionResult> GetListaDeliveryTakeaways()
        {
            try
            {
                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;
                if (IdSucursal == Guid.Empty) throw new Exception("Sucursal no identificada");
                var result = await _deliveryTakeawayServices.GetListaDeliveryTakeaways(IdSucursal);
                if (result == null) throw new Exception("Error al obtener los pedidos");
                var response = result.Select(r => new DeliveryTakeawayResponseDTO
                {
                    Id = r.Id,
                    IdSucursal = r.IdSucursal,
                    IdTipoEnvio = r.IdTipoEnvio,
                    IdVisita = r.IdVisita,
                    FechaHora = r.FechaHora,
                    NombreCliente = r.NombreCliente ?? "",
                    Direccion = r.Direccion,
                    Indicaciones = r.Indicaciones,
                    Telefono = r.Telefono ?? "",
                    PrecioTotal = r.PrecioTotal,
                    Entregado = r.Entregado,
                    Productos = (r.Visita?.Productos ?? new List<ProductosPorVisita>()).Select(p => new ItemDTO
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
                }).ToList();
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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDeliveryTakeawayPorId(Guid id)
        {
            var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;
            if (IdSucursal == Guid.Empty) throw new Exception("Sucursal no identificada");
            var result = await _deliveryTakeawayServices.ObtenerDeliveryTakeawayPorId(id);
            if (result == null) throw new Exception("Error al obtener los pedidos");
            var response = new DeliveryTakeawayResponseDTO
            {
                Id = result.Id,
                IdSucursal = result.IdSucursal,
                IdTipoEnvio = result.IdTipoEnvio,
                IdVisita = result.IdVisita,
                FechaHora = result.FechaHora,
                NombreCliente = result.NombreCliente ?? "",
                Direccion = result.Direccion ?? "",
                Indicaciones = result.Indicaciones,
                Telefono = result.Telefono ?? "",
                PrecioTotal = result.PrecioTotal,
                Entregado = result.Entregado,
                Productos = (result.Visita?.Productos ?? new List<ProductosPorVisita>()).Select(p => new ItemDTO
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
            return Ok(response);
        }

        [HttpPost("Crear")]
        public async Task<IActionResult> CreateDeliveryTakeaway(CrearDeliveryTakeawayDTO request)
        {
            try
            {
                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;
                if (IdSucursal == Guid.Empty) throw new Exception("Sucursal no identificada");

                var result = await _deliveryTakeawayServices.CrearDeliveryTakeaway(IdSucursal, request);
                if (result == null) throw new Exception("Error al crear el pedido");
                var response = new DeliveryTakeawayResponseDTO
                {
                    Id = result.Id,
                    IdSucursal = result.IdSucursal,
                    IdTipoEnvio = result.IdTipoEnvio,
                    IdVisita = result.IdVisita,
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
                    case "Error al crear el pedido":
                        return BadRequest("Error al crear el pedido. Verifica los datos enviados y vuelve a intentarlo.");

                    case "Sucursal no identificada":
                        return BadRequest("Sucursal no identificada. Asegúrate de que el token contenga el claim 'IdSucursal'.");

                    default:
                        return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
        }

        [HttpPost("ModificarDatos")]
        public async Task<IActionResult> ModificarDatosDeliveryTakeaway(ModificarDeliveryTakeawayDTO request)
        {
            try
            {
                if (request.IdDeliveryTakeaway == Guid.Empty) throw new Exception("Id del pedido nulo");
                var result = await _deliveryTakeawayServices.ModificarDatosDeliveryTakeaway(request.IdDeliveryTakeaway, request);
                if (result == null) throw new Exception("Error al modificar el pedido");
                var response = new DeliveryTakeawayResponseDTO
                {
                    Id = result.Id,
                    IdSucursal = result.IdSucursal,
                    IdTipoEnvio = result.IdTipoEnvio,
                    IdVisita = result.IdVisita,
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
                    default:
                        return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
        }

        //[HttpPost("/ModificarProductos")]
        //public async Task<IActionResult> ModificarProductosDeliveryTakeaway(ModificarProductosDeliveryTakeawayDTO request)
        //{
        //    try
        //    {
        //        if (request.IdDeliveryTakeaway == Guid.Empty) throw new Exception("Id del pedido nulo");
        //        var result = await _deliveryTakeawayServices.ModificarProductosDeliveryTakeaway(request.IdDeliveryTakeaway, request);
        //        if (result == null) throw new Exception("Error al modificar los productos del pedido");
        //        var response = new DeliveryTakeawayResponseDTO
        //        {
        //            Id = result.Id,
        //            IdSucursal = result.IdSucursal,
        //            IdTipoEnvio = result.IdTipoEnvio,
        //            IdVisita = result.IdVisita,
        //            FechaHora = result.FechaHora,
        //            NombreCliente = result.NombreCliente ?? "",
        //            Direccion = result.Direccion,
        //            Indicaciones = result.Indicaciones,
        //            Telefono = result.Telefono ?? "",
        //            PrecioTotal = result.PrecioTotal,
        //            Entregado = result.Entregado
        //        };
        //        return Ok(response);
        //    }
        //    catch (Exception ex)
        //    {
        //        switch (ex.Message)
        //        {
        //            case "Id del pedido nulo":
        //                return BadRequest("Id del pedido nulo. Asegúrate de enviar un Id válido en el campo 'IdDeliveryTakeaway'.");
        //            case "Error al modificar los productos del pedido":
        //                return BadRequest("Error al modificar los productos del pedido. Verifica los datos enviados y vuelve a intentarlo.");
        //            default:
        //                return StatusCode(500, $"Internal server error: {ex.Message}");
        //        }
        //    }
        //}

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
                        return BadRequest("Id del pedido nulo. Asegúrate de enviar un Id válido como parámetro.");
                    case "Error al eliminar el pedido":
                        return BadRequest("Error al eliminar el pedido. Verifica el Id enviado y vuelve a intentarlo.");
                    default:
                        return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
        }
    }
}

