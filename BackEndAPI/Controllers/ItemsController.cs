using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.DTOs.Response;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace BackEndAPI.Controllers
{
    public class ItemsDTO
    {
        public int Id { get; set; }
        public string? Indicaciones { get; set; }
    }

    [Route("[controller]")]
    [ApiController]
    public class ItemsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ItemsController(AppDbContext context)
        {
            _context = context;
        }

        //[HttpPost("{numeroMesa}")]
        //public async Task<ActionResult> Post(int numeroMesa, List<ItemsDTO> items)
        //{
        //    try
        //    {
        //        var mesa = await _context.Mesas.FirstOrDefaultAsync(mesa => mesa.NumeroMesa == numeroMesa);
        //        var pedido = await _context.Pedidos.FirstOrDefaultAsync(pedido => pedido.Mesa == mesa && pedido.Activo == true);

        //        if (mesa == null) { return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se encontró una mesa con el numero: {numeroMesa}")); };
        //        if (pedido == null) { return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se encontró un pedido activo en la mesa : {numeroMesa}")); };

        //        List<Item> ListaItems = new List<Item>();
        //        foreach (var item in items)
        //        {
        //            var producto = await _context.Productos.FindAsync(item.Id);
        //            var ItemAgregar = new Item
        //            {
        //                Nombre = producto.Nombre,
        //                Indicaciones = item.Indicaciones,
        //                Precio = producto.Precio,
        //                Estado = Estado.Creado,
        //                PedidoId = pedido.Id
        //            };
        //            _context.Items.Add(ItemAgregar);
        //            ListaItems.Add(ItemAgregar);
        //        }

        //        await _context.SaveChangesAsync();
        //        return Ok(ListaItems);
        //    }
        //    catch (Exception e)
        //    {
        //        return StatusCode(500, "Internal server error catch: Post Items - " + e.Message);
        //    }
        //}

        //[HttpPut("{estado}")]
        //public async Task<ActionResult> Put(string estado, List<int> request)
        //{
        //    try
        //    {
        //        List<int> lista = new List<int>();
        //        foreach (var Id in request)
        //        {
        //            var itemBuscado = await _context.Items.FindAsync(Id);
        //            if (itemBuscado != null)
        //            {
        //                itemBuscado.Estado = estado == "Pagar" ? Estado.Pagado : Estado.Procesando;
        //                lista.Add(Id);
        //            }
        //        }
        //        await _context.SaveChangesAsync();
        //        return Ok(lista);
        //    }
        //    catch (Exception e)
        //    {
        //        return StatusCode(500, "Internal server error catch: Put Items - " + e.Message);
        //    }
        //}

        //[HttpDelete]
        //public async Task<ActionResult> Delete(List<int> requestIds)
        //{
        //    try
        //    {
        //        List<int> borrados = new List<int>();
        //        foreach (var id in requestIds)
        //        {
        //            var item = await _context.Items.FindAsync(id);
        //            if (item != null)
        //            {
        //                _context.Items.Remove(item);
        //                borrados.Add(item.Id);
        //            }
        //        }
        //        await _context.SaveChangesAsync();
        //        return Ok(borrados);
        //    }
        //    catch (Exception e)
        //    {
        //        return StatusCode(500, "Internal server error catch: Delete Items - " + e.Message);
        //    }
        //}
    }
}

