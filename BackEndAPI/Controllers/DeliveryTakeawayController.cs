using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Exceptions;
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
            var ultimoPago = deliveryTakeaway.Visita?.Pagos
                .OrderByDescending(p => p.FechaMovimiento)
                .FirstOrDefault();

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
                Pago = ultimoPago != null ? new PagoDTO
                {
                    Id = ultimoPago.Id,
                    IdVisita = ultimoPago.IdVisita ?? Guid.Empty,
                    tipoMovimientoCaja = ultimoPago.TipoMovimientoCaja,
                    MontoAbonado = ultimoPago.MontoAbonado,
                    MontoTotal = ultimoPago.MontoTotal,
                    Vuelto = ultimoPago.Vuelto,
                    FechaCreacion = ultimoPago.FechaMovimiento
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
            var idSucursal = ObtenerIdSucursal();
            var result = await _deliveryTakeawayServices.GetListaDeliveryTakeaways(idSucursal);
            var response = (result ?? Enumerable.Empty<DeliveryAndTakeaway>()).Select(MappearDeliveryTakeawayDTO).ToList();
            return Ok(response);
        }

        [HttpGet("Caja/{idCaja}")]
        public async Task<IActionResult> GetListaDeliveryTakeawaysPorCaja(Guid idCaja)
        {
            var idSucursal = ObtenerIdSucursal();
            var result = await _deliveryTakeawayServices.GetListaDeliveryTakeawaysPorCaja(idSucursal, idCaja);
            var response = (result ?? Enumerable.Empty<DeliveryAndTakeaway>()).Select(MappearDeliveryTakeawayDTO).ToList();
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDeliveryTakeawayPorId(Guid id)
        {
            var result = await _deliveryTakeawayServices.ObtenerDeliveryTakeawayPorId(id);
            var response = MappearDeliveryTakeawayDTO(result!);
            return Ok(response);
        }

        [HttpPost("Crear")]
        public async Task<IActionResult> CreateDeliveryTakeaway(CrearDeliveryTakeawayDTO request)
        {
            var idSucursal = ObtenerIdSucursal();
            var result = await _deliveryTakeawayServices.CrearDeliveryTakeaway(idSucursal, request);
            var response = MappearDeliveryTakeawayDTO(result!);
            return Ok(response);
        }

        [HttpPatch("ModificarDatos")]
        public async Task<IActionResult> ModificarDeliveryTakeaway(ModificarDeliveryTakeawayDTO request)
        {
            var result = await _deliveryTakeawayServices.ModificarDeliveryTakeaway(request);
            var response = MappearDeliveryTakeawayDTO(result!);
            return Ok(response);
        }

        [HttpPatch("Entregado")]
        public async Task<IActionResult> MarcarEntregado([FromQuery] Guid id, [FromQuery] bool entregado = true)
        {
            var action = await _deliveryTakeawayServices.MarcarComoEntregado(id, entregado);
            return Ok(MappearDeliveryTakeawayDTO(action!));
        }

        [HttpDelete]
        public async Task<IActionResult> EliminarDeliveryTakeaway([FromQuery] Guid id)
        {
            await _deliveryTakeawayServices.EliminarDeliveryTakeaway(id);
            return Ok(new EntregaDTO(200, "DELETED", "Pedido eliminado correctamente"));
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
