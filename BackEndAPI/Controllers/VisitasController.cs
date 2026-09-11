using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
   [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class VisitasController : ControllerBase
    {
        private readonly IVisitasServices _visitasServices;

        public VisitasController(IVisitasServices visitasServices)
        {
            _visitasServices = visitasServices;
        }

        // Ya no hay try/catch acá: si algo falla, la excepción (tipada o no) burbujea hasta
        // ExceptionHandlingMiddleware, que decide el status code y loguea con el contexto completo.

        [HttpGet("/VisitasActivas")]
        public async Task<IActionResult> VisitasActivas()
        {
            var visitasActivas = await _visitasServices.ObtenerVisitasActivas();
            return Ok(visitasActivas.Select(MapearVisita).ToList());
        }

        [HttpGet("/TodasLasVisitas")]
        public async Task<IActionResult> TodasLasVisitas()
        {
            var visitas = await _visitasServices.ObtenerTodasLasVisitas();
            return Ok(visitas.Select(MapearVisita).ToList());
        }

        [HttpGet("/Visita")]
        public async Task<IActionResult> GetVisitaPorId(Guid IdVisita)
        {
            var visitaBuscada = await _visitasServices.BuscarVisitaPorId(IdVisita);
            return Ok(MapearVisita(visitaBuscada));
        }

        [HttpPost("/AgregarProductoAVisita")]
        public async Task<IActionResult> AgregarproductosAVisita([FromBody] ICollection<AgregarProductoAVisita> listaProductos, [FromQuery] Guid IdVisita)
        {
            var visitaActualizada = await _visitasServices.AgregarProductos(listaProductos, IdVisita);
            return Ok(MapearVisita(visitaActualizada));
        }

        [HttpDelete("/Visitas/EliminarProductos")]
        public async Task<IActionResult> EliminarProducto([FromBody] EliminarProductosDTO request)
        {
            await _visitasServices.EliminarProductos(request.IdVisita, request.IdsProductos);
            return Ok(new EntregaDTO(200, "OK", "Productos eliminados correctamente de la visita"));
        }

        [HttpPatch("/Visitas/CambiarEstadoProducto")]
        public async Task<IActionResult> CambiarEstadoProducto([FromBody] CambiarEstadoProductoDTO request)
        {
            await _visitasServices.CambiarEstadoProducto(request.IdProducto, request.Estado);
            return Ok(new EntregaDTO(200, "OK", "Estado del producto actualizado correctamente"));
        }

        // Antes había 4 bloques de mapeo a VisitaResponseDTO repetidos y con formas
        // ligeramente distintas entre sí: GetVisitaPorId no devolvía Mozo, y
        // AgregarproductosAVisita no devolvía IdMesa/NumeroMesa/Mozo. Quedan unificados
        // acá con la forma más completa (la que ya usaban VisitasActivas/TodasLasVisitas).
        private static VisitaResponseDTO MapearVisita(Visita visita) => new VisitaResponseDTO
        {
            Id = visita.Id,
            FechaHora = visita.FechaHora,
            Estado = visita.Estado,
            Total = visita.Total,
            Origen = visita.Origen,
            IdMesa = visita.Mesa?.Id,
            NumeroMesa = visita.Mesa?.Nombre,
            Mozo = visita.Mozo != null ? new MozoEnVisitaDTO
            {
                Id = visita.Mozo.Id,
                CodigoDeServicio = visita.Mozo.CodigoDeServicio,
                Nombres = visita.Mozo.Nombres ?? string.Empty,
                Apellido = visita.Mozo.Apellido ?? string.Empty,
            } : null,
            ProductosConsumidos = visita.Productos?.Select(item => new ItemDTO
            {
                Id = item.Id,
                IdProducto = item.IdProducto,
                Nombre = item.NombreProducto,
                Indicaciones = item.Detalles,
                Precio = item.PrecioDelMomento,
                EstadoPagado = item.EstadoPagado,
                EstadoPedido = item.EstadoPedido,
                FechaAgregado = item.FechaAgregado,
                IdMovimientoCaja = item.IdMovimientoCaja,
            }).ToList() ?? new List<ItemDTO>(),
        };
    }
}
