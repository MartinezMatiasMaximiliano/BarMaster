using BackEndAPI.Data;
using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class MesasController : ControllerBase
    {
        private readonly ApiDbContext _context;

        public MesasController(ApiDbContext context)
        {
            _context = context;
        }

        //[HttpGet]
        //public async Task<ActionResult<Mesa>> Get()
        //{
        //    var busqueda = await _context.Mesas.Include(mesa => mesa.Persona).OrderBy(mesa => mesa.Id).ToListAsync();
        //    var listaMesas = busqueda.Select(mesa => new Mesa
        //    {
        //        Id = mesa.Id,
        //        NumeroMesa = mesa.NumeroMesa,
        //        CodigoParaPedir = mesa.CodigoParaPedir,
        //        Persona = mesa.Persona != null ? new Persona
        //        {
        //            Id = mesa.Persona.Id,
        //            Nombres = mesa.Persona.Nombres,
        //            Apellido = mesa.Persona.Apellido,
        //            Activo = mesa.Persona.Activo,
        //            CodigoDeServicio = mesa.Persona.CodigoDeServicio,
        //            Direccion = mesa.Persona.Direccion,
        //            Dni = mesa.Persona.Dni,
        //            Rol = mesa.Persona.Rol,
        //            Telefono = mesa.Persona.Telefono
        //        } : null
        //    });
        //    return Ok(listaMesas);
        //}

        //[HttpGet("{Id}")]
        //public async Task<ActionResult<Mesa>> Get(int Id)
        //{
        //    var busqueda = await _context.Mesas.Include(mesa => mesa.Persona).FirstAsync(mesa => mesa.Id == Id);
        //    if (busqueda == null)
        //    {
        //        return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se encontró una mesa con el Id: {Id}"));
        //    }

        //    var mesaDTO = new MesaDTO
        //    {
        //        Id = busqueda.Id,
        //        NumeroMesa = busqueda.NumeroMesa,
        //        //CodigoParaPedir = busqueda.CodigoParaPedir,
        //        //Encargado = busqueda.Persona != null ? new Persona
        //        //{
        //        //    //Id = busqueda.Persona.Id,
        //        //    Nombres = busqueda.Persona.Nombres,
        //        //    Apellido = busqueda.Persona.Apellido,
        //        //    Activo = busqueda.Persona.Activo,
        //        //    CodigoDeServicio = busqueda.Persona.CodigoDeServicio,
        //        //    Direccion = busqueda.Persona.Direccion,
        //        //    Dni = busqueda.Persona.Dni,
        //        //    Rol = busqueda.Persona.Rol,
        //        //    Telefono = busqueda.Persona.Telefono
        //        //} : null
        //    };

        //    return Ok(mesaDTO);
        //}

        //[HttpGet("VerificarCodigo")]
        //public async Task<ActionResult<Mesa>> Get(string codigo)
        //{
        //    var busqueda = await _context.Mesas.Include(mesa => mesa.Persona).FirstOrDefaultAsync(mesa => mesa.CodigoParaPedir == codigo);
        //    if (busqueda == null)
        //    {
        //        return Ok(new EntregaDTO(404,"NOT FOUND", $"No se pudo encontrar una mesa abierta con el codigo: {codigo}"));
        //    }

        //    var mesaDTO = new MesaDTO
        //    {
        //        Id = busqueda.Id,
        //        NumeroMesa = busqueda.NumeroMesa
        //    };

        //    return Ok(new {data =  new { tipo = "OK", datosMesa = mesaDTO }  });
        //}

        //[HttpPost]
        //public async Task<ActionResult> Post(CrearMesaDTO DTO)
        //{
        //    var busqueda = await _context.Mesas.FirstOrDefaultAsync(mesa => mesa.NumeroMesa == DTO.NumeroMesa);

        //    if (busqueda != null)
        //    {
        //        return BadRequest(new ErrorDTO(400, "BAD REQUEST", $"Ya existe una Mesa de numero {DTO.NumeroMesa}"));
        //    }

        //    var mesa = new Mesa();

        //    mesa.NumeroMesa = DTO.NumeroMesa;

        //    _context.Mesas.Add(mesa);
        //    await _context.SaveChangesAsync();
        //    return Created("created", new EntregaDTO(201, "CREATED", $"Creado exitosamente, Id:{mesa.Id}"));
        //}

        //[HttpPut("{Id}")]
        //public async Task<ActionResult> Put(int Id, CrearMesaDTO request)
        //{
        //    var busqueda = await _context.Mesas.Include(mesa => mesa.Persona).FirstAsync(mesa => mesa.Id == Id);

        //    if (busqueda == null)
        //    {
        //        return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se encontró una mesa con el Id: {Id}"));
        //    }

        //    busqueda.NumeroMesa = request.NumeroMesa != -1 ? request.NumeroMesa : busqueda.NumeroMesa;
        //    //busqueda.CodigoParaPedir = !string.IsNullOrEmpty(request.CodigoParaPedir) ? request.CodigoParaPedir : busqueda.CodigoParaPedir;


        //    if (request.MozoId != -1)
        //    {
        //        var persona = await _context.Personas.FirstAsync(persona => persona.Id == request.MozoId);
        //        busqueda.Persona = persona;
        //    }

        //    _context.Entry(busqueda).State = EntityState.Modified;
        //    await _context.SaveChangesAsync();
        //    return Ok(new EntregaDTO(200, "MODIFIED", $"Modificado exitosamente, Id:{busqueda.Id}"));
        //}

        //[HttpPut("{Id}/{Accion}")]
        //public async Task<ActionResult> Put(int Id, string Accion,string codigoMozo)
        //{
        //    var mesaBuscada = await _context.Mesas.Include(mesa => mesa.Persona).FirstOrDefaultAsync(mesa => mesa.Id == Id);
            
        //    if (mesaBuscada == null)
        //    {
        //        return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se encontró una mesa con el Id: {Id}"));
        //    }

        //    if (Accion == "Cerrar")
        //    {
        //        mesaBuscada.CodigoParaPedir = null;
        //        mesaBuscada.Persona = null;
        //        var pedidoDeLaMesa = await _context.Pedidos.Include(pedido => pedido.Items).FirstOrDefaultAsync(pedido => pedido.Mesa == mesaBuscada && pedido.Activo == true);

        //        if (pedidoDeLaMesa.Items.Count() == 0)
        //        {
        //            _context.Pedidos.Remove(pedidoDeLaMesa);                 
        //        }
        //        else
        //        {
        //            pedidoDeLaMesa.Activo = false;
        //            foreach(var item in pedidoDeLaMesa.Items)
        //            {
        //                item.Estado = Estado.Pagado;
        //            }
        //            _context.Entry(pedidoDeLaMesa).State = EntityState.Modified;
        //        }

        //        _context.Entry(mesaBuscada).State = EntityState.Modified;
        //        await _context.SaveChangesAsync();

        //        return Ok(new {Mensaje = "Mesa cerrada",numeroMesa = mesaBuscada.NumeroMesa,pedidoId = pedidoDeLaMesa.Id });
        //    }
        //    else if (Accion == "Abrir")
        //    {
        //        var mozoBuscado = await _context.Personas.FirstOrDefaultAsync(persona => persona.CodigoDeServicio == codigoMozo);

        //        if (mozoBuscado == null)
        //        {
        //            return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se encontró un mozo con el codigo: {codigoMozo}"));
        //        }
        //        mesaBuscada.CodigoParaPedir = Helpers.CrearCodigoMesa();
        //        mesaBuscada.Persona = mozoBuscado;
        //        var pedido = new Pedido
        //        {
        //            Mesa = mesaBuscada,
        //            FechaRealizado = DateTime.UtcNow,
        //            Activo = true,
        //        };

        //        _context.Pedidos.Add(pedido);
        //        await _context.SaveChangesAsync();

        //        var respuesta = new PedidoDTO
        //        {
        //            Id = pedido.Id,
        //            FechaRealizado = pedido.FechaRealizado,
        //            IdMesa = pedido.Mesa.Id,
        //            NumeroMesa = pedido.Mesa.NumeroMesa,
        //            Activo = pedido.Activo
        //        };

        //        _context.Entry(mesaBuscada).State = EntityState.Modified;
        //        await _context.SaveChangesAsync();
        //        return Ok(new { Mensaje = "Mesa abierta y pedido creado", Pedido = respuesta });
        //    } else
        //    {
        //        return BadRequest(new ErrorDTO(400, "BAD REQUEST", "Accion incorrecta"));
        //    }

        //}

        //[HttpDelete("{Id}")]
        //[Authorize]
        //public async Task<ActionResult> Delete(int Id)
        //{
        //    var mesa = await _context.Mesas.FindAsync(Id);

        //    if (mesa == null)
        //    {
        //        return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se encontró una Mesa de Id:{Id}"));
        //    }

        //    _context.Mesas.Remove(mesa);
        //    await _context.SaveChangesAsync();
        //    return Ok(new EntregaDTO(200, "OK", $"Borrado con exito, Id:{Id}"));

        //}

    }
}
