using BackEndAPI.Data;
using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.Mapping;
using System.Runtime.CompilerServices;
using System.Security.Cryptography.X509Certificates;

namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class VisitasController : ControllerBase
    {
        private readonly IVisitasServices _visitasServices;

        public VisitasController(IVisitasServices visitasServices)
        {
            _visitasServices = visitasServices;
        }

        [HttpGet("/VisitasActivas")]
        public async Task<IActionResult> VisitasActivas()
        {
            try
            {
                var visitasActivas = await _visitasServices.ObtenerVisitasActivas();
                var response = visitasActivas.Select(visita => new VisitaResponseDTO
                {
                    Id = visita.Id,
                    FechaHora = visita.FechaHora,
                    Estado = visita.Estado,
                    IdMesa = visita.Mesa?.Id,
                    NumeroMesa = visita.Mesa?.Nombre,
                    ProductosConsumidos = visita.Productos?.Select(item => new ItemDTO
                    {
                        Id = item.Id,
                        Nombre = item.NombreProducto,
                        Indicaciones = item.Detalles,
                        Precio = item.PrecioDelMomento,
                        EstadoPagado = item.EstadoPagado,
                    }).ToList() ?? new List<ItemDTO>(),
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error catch: VisitasActivas - " + ex.Message);
            }
        }

        [HttpGet("/TodasLasVisitas")]
        public async Task<IActionResult> TodasLasVisitas()
        {
            try
            {
                var visitas = await _visitasServices.ObtenerTodasLasVisitas();
                var response = visitas.Select(visita => new VisitaResponseDTO
                {
                    Id = visita.Id,
                    FechaHora = visita.FechaHora,
                    Estado = visita.Estado,
                    Total = visita.Total,
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
                        Nombre = item.NombreProducto,
                        Indicaciones = item.Detalles,
                        Precio = item.PrecioDelMomento,
                        EstadoPagado = item.EstadoPagado,
                    }).ToList() ?? new List<ItemDTO>(),
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error catch: TodasLasVisitas - " + ex.Message);
            }
        }

        [HttpGet("/Visita")]
        public async Task<IActionResult> GetVisitaPorId(Guid IdVisita)
        {
            try
            {
                var visitaBuscada = await _visitasServices.BuscarVisitaPorId(IdVisita);
                var Response = new VisitaResponseDTO
                {
                    Id = visitaBuscada.Id,
                    FechaHora = visitaBuscada.FechaHora,
                    Estado = visitaBuscada.Estado,
                    IdMesa = visitaBuscada.Mesa?.Id,
                    NumeroMesa = visitaBuscada.Mesa?.Nombre,
                    ProductosConsumidos = visitaBuscada.Productos.Select(item => new ItemDTO
                    {
                        Id = item.Id,
                        Nombre = item.NombreProducto,
                        Indicaciones = item.Detalles,
                        Precio = item.PrecioDelMomento,
                        EstadoPagado = item.EstadoPagado,
                    }).ToList(),
                };

                return Ok(Response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Visita no encontrada":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", ex.Message));
                    default:
                        return StatusCode(500, "Internal server error catch: Get Visita por Id - " + ex.Message);
                }
            }
        }

        [HttpPost("/AgregarProductoAVisita")]
        public async Task<IActionResult> AgregarproductosAVisita([FromBody] ICollection<AgregarProductoAVisita> listaProductos, [FromQuery]Guid IdVisita)
        {
            try
            {
                var visitaActualizada = await _visitasServices.AgregarProductos(listaProductos, IdVisita);
                
                // Mapear a DTO para evitar referencias circulares
                var response = new VisitaResponseDTO
                {
                    Id = visitaActualizada.Id,
                    FechaHora = visitaActualizada.FechaHora,
                    Estado = visitaActualizada.Estado,
                    ProductosConsumidos = visitaActualizada.Productos.Select(item => new ItemDTO
                    {
                        Id = item.Id,
                        Nombre = item.NombreProducto,
                        Indicaciones = item.Detalles,
                        Precio = item.PrecioDelMomento,
                        EstadoPagado = item.EstadoPagado,
                    }).ToList(),
                };
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    default:
                        return StatusCode(500, "Internal server error catch: Agregar productos a visita - " + ex.Message);

                }

            }
        }

        [HttpPost("/Visitas/Pagar")]
        public async Task<IActionResult> PagarProductos([FromBody] PagarProductosDTO request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new ErrorDTO(400, "BAD REQUEST", "El request no puede ser nulo"));
                }

                if (request.IdVisita == Guid.Empty)
                {
                    return BadRequest(new ErrorDTO(400, "BAD REQUEST", "El IdVisita no puede estar vacío"));
                }

                if (request.IdsProductos == null || request.IdsProductos.Count == 0)
                {
                    return BadRequest(new ErrorDTO(400, "BAD REQUEST", "La lista de IDs de productos no puede estar vacía"));
                }

                await _visitasServices.PagarProductos(request.IdVisita, request.IdsProductos);
                
                return Ok(new { message = "Productos marcados como pagados correctamente" });
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Visita no encontrada":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", ex.Message));
                    case "Lista de IDs de productos vacía":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return StatusCode(500, "Internal server error catch: Pagar productos - " + ex.Message);
                }
            }
        }

        [HttpDelete("/Visitas/EliminarProductos")]
        public async Task<IActionResult> EliminarProducto([FromBody] EliminarProductosDTO request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new ErrorDTO(400, "BAD REQUEST", "El request no puede ser nulo"));
                }

                if (request.IdVisita == Guid.Empty)
                {
                    return BadRequest(new ErrorDTO(400, "BAD REQUEST", "El IdVisita no puede estar vacío"));
                }

                if (request.IdsProductos == null || request.IdsProductos.Count == 0)
                {
                    return BadRequest(new ErrorDTO(400, "BAD REQUEST", "La lista de IDs de productos no puede estar vacía"));
                }

                await _visitasServices.EliminarProductos(request.IdVisita, request.IdsProductos);
                
                return Ok(new { message = "Productos eliminados correctamente de la visita" });
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Visita no encontrada":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", ex.Message));
                    case "Lista de IDs de productos vacía":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "El IdVisita no puede estar vacío":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return StatusCode(500, "Internal server error catch: Eliminar productos - " + ex.Message);
                }
            }
        }

        [HttpPatch("/Visitas/CambiarEstadoProducto")]
        public async Task<IActionResult> CambiarEstadoProducto([FromBody] CambiarEstadoProductoDTO request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new ErrorDTO(400, "BAD REQUEST", "El request no puede ser nulo"));
                }

                await _visitasServices.CambiarEstadoProducto(request.IdProducto, request.Estado);
                
                return Ok(new { message = "Estado del producto actualizado correctamente" });
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Producto no encontrado":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", ex.Message));
                    case var msg when msg.Contains("no es válido"):
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "El IdProducto debe ser mayor a cero":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "El estado no puede estar vacío":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return StatusCode(500, "Internal server error catch: Cambiar estado producto - " + ex.Message);
                }
            }
        }
    }
}


#region CODIGO VIEJO
//[HttpGet]
//public async Task<ActionResult<List<PedidoDTO>>> Get()
//{
//    var busqueda = await _context.Pedidos.Include(pedido => pedido.Items).Include(Pedido => Pedido.Mesa).ToListAsync();

//    var response = busqueda.Select(pedido => new PedidoDTO
//    {
//        Id = pedido.Id,
//        FechaRealizado = pedido.FechaRealizado,
//        IdMesa = pedido.Mesa.Id,
//        NumeroMesa = pedido.Mesa.NumeroMesa,
//        Activo = pedido.Activo,
//        Items = pedido.Items.Select(item => new ItemDTO
//        {
//            Id = item.Id,
//            Nombre = item.Nombre,
//            Indicaciones = item.Indicaciones,
//            Precio = item.Precio,
//            Estado = item.Estado,
//        }).ToList(),

//    });
//    return Ok(response);
//}

//[HttpGet("{Id}")]
//public async Task<ActionResult<PedidoDTO>> Get(int Id)
//{
//    var busqueda = await _context.Pedidos.Include(pedido => pedido.Items).Include(Pedido => Pedido.Mesa).FirstOrDefaultAsync(pedido => pedido.Id == Id);

//    var response = new PedidoDTO
//    {
//        Id = busqueda.Id,
//        FechaRealizado = busqueda.FechaRealizado,
//        IdMesa = busqueda.Mesa.Id,
//        NumeroMesa = busqueda.Mesa.NumeroMesa,
//        Activo = busqueda.Activo,
//        Items = busqueda.Items.Select(item => new ItemDTO
//        {
//            Id = item.Id,
//            Nombre = item.Nombre,
//            Indicaciones = item.Indicaciones,
//            Precio = item.Precio,
//            Estado = item.Estado,
//        }).ToList(),
//    };
//    return Ok(response);
//}

//[HttpGet("/Ticket/{NumeroMesa}")]
//public async Task<ActionResult<TicketDTO>> GetPorMesa(int NumeroMesa)
//{

//    var mesa = await _context.Mesas.FirstOrDefaultAsync(mesa => mesa.NumeroMesa == NumeroMesa);

//    if (mesa == null)
//    {
//        return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se encontró una mesa con NumeroMesa: {NumeroMesa}"));
//    }

//    var pedido = await _context.Pedidos.Include(pedido => pedido.Items).FirstOrDefaultAsync(pedido => pedido.Mesa.Id == mesa.Id && pedido.Activo == true);

//    if (pedido == null)
//    {
//        return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se encontró un pedido activo para la mesa : {NumeroMesa}"));
//    }
//    decimal total = 0;
//    if (pedido.Items != null)
//    {
//        foreach (var item in pedido.Items)
//        {
//            total += item.Precio;
//        }
//    }

//    var ticket = new TicketDTO
//    {
//        IdPedido = pedido.Id,
//        total = total,
//        FechaInicio = pedido.FechaRealizado,
//        IdMesa = mesa.Id,
//        numeroMesa = mesa.NumeroMesa,

//        items = pedido.Items.Select(item => new Ticket
//        {
//            Id = item.Id,
//            NombreProducto = item.Nombre,
//            Indicaciones = item.Indicaciones,
//            Precio = item.Precio,
//            Estado = item.Estado

//        }).ToList(),
//    };


//    return Ok(ticket);
//}

//[HttpPut("/Pagar/{PedidoId}")]
//public async Task<ActionResult> Put(int PedidoId)
//{
//    var busqueda = await _context.Pedidos.Include(pedido => pedido.Items).FirstOrDefaultAsync(pedido => pedido.Id == PedidoId);

//    if (busqueda.Items != null)
//    {
//        foreach (var pedido in busqueda.Items)
//        {
//            pedido.Estado = Estado.Pagado;
//            _context.Entry(pedido).State = EntityState.Modified;
//        }
//    }

//    busqueda.Activo = false;
//    await _context.SaveChangesAsync();
//    return Ok();
//}

//public class TicketPDFDTO
//{
//    public int NumeroMesa { get; set; }
//    public List<int> ListaItems { get; set; }
//}

//[HttpPost("GenerarTicketPDF")]
//public async Task<ActionResult> GenerarTicketPDF(TicketPDFDTO request)
//{
//    try
//    {
//        if(request.ListaItems == null || request.ListaItems.Count == 0)
//        {
//            return BadRequest(new ErrorDTO(400, "BAD REQUEST", $"No se recibieron items para generar el ticket."));
//        }

//        List<Item> lista = new List<Item>();
//        foreach (var Id in request.ListaItems)
//        {
//            var itemBuscado = await _context.Items.FindAsync(Id);
//            if (itemBuscado != null)
//            {
//                lista.Add(itemBuscado);
//            }
//        }


//        var pdfBytes = GeneradorPDF.GenerarTicket(lista[0].PedidoId, request.NumeroMesa, lista);
//        return File(pdfBytes,"application/pdf","nombre.pdf");
//    }
//    catch (Exception e)
//    {
//        return StatusCode(500, "Internal server error catch: Put Items - " + e.Message);
//    }
//}

//TODO: deberia borrar los items que pertenecen a un pedido? en que situacion se borraria un pedido con items? 
//[HttpDelete("{Id}")]
//public async Task<ActionResult> Delete(int Id)
//{
//    var busqueda = await _context.Pedidos.Include(pedido => pedido.Producto).Include(pedido => pedido.Mesa).FirstAsync(pedido => pedido.Id == Id);

//    if (busqueda == null)
//    {
//        return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se encontró un producto con Id: {Id}"));
//    }

//    _context.Pedidos.Remove(busqueda);
//    await _context.SaveChangesAsync();
//    return Ok(new EntregaDTO(200, "OK", $"Eliminado exitosamente, Id:{Id}"));

//}
#endregion