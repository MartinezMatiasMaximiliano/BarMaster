using BackEndAPI.Data;
using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services;
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
    public class PedidosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PedidosController(AppDbContext context)
        {
            _context = context;
        }

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
    }
}
