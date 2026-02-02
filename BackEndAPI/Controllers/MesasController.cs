using BackEndAPI.Data;
using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services;
using BackEndAPI.Services.Interfaces;
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
        private readonly IMesasServices _mesasServices;
        public MesasController(IMesasServices mesasServices)
        {
            _mesasServices = mesasServices;
        }

        [HttpPost("/Mesa")]
        public async Task<ActionResult> CrearMesa(CrearMesaDTO DTO)
        {
            try
            {
                if (DTO.Nombre == string.Empty)
                {
                    throw new Exception("El nombre de la mesa no puede estar vacio");
                }

                var mesaCreada = await _mesasServices.CrearMesa(DTO);
                return Created("created", new EntregaDTO(201, "CREATED", $"Creado exitosamente, Id:{mesaCreada.Id}"));

            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El nombre de la mesa no puede estar vacio":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "Ya existe la mesa en el plano seleccionado":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                }

            }
        }

        [HttpPatch("/Mesa")]
        public async Task<ActionResult> ActualizarMesa(ModificarMesaDTO DTO)
        {
            try
            {
                var mesaActualizada = await _mesasServices.ModificarMesa(DTO);

                return Ok(new EntregaDTO(200, "MODIFIED", $"Modificado exitosamente, Id:{mesaActualizada.Id}"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "No se encontró la mesa con el Id especificado":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", ex.Message));
                    case "Ya existe la mesa en el plano seleccionado":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                }
            }
        }

        [HttpPatch("/Mesa/AbrirCerrar")]
        public async Task<ActionResult> AbrirCerrarMesa([FromBody] AbrirMesaDTO request)
        {
            try
            {
                var Visita = await _mesasServices.AbrirCerrarMesa(request);
                string accion = request.Abrir ? "abrir" : "cerrar";
                
                var response = new VisitaDTO
                {
                    Id = Visita.Id,
                    IdCaja = Visita.IdCaja,
                    IdMesa = Visita.IdMesa,
                    IdMozo = Visita.IdMozo ?? Guid.Empty,
                    FechaHora = Visita.FechaHora,
                    Estado = Visita.Estado
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "No se encontró un mozo con ese codigo de servicio":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", ex.Message));
                    case "No hay una caja abierta para asignar la visita":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "No se encontró la mesa con el Id especificado":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", ex.Message));
                    case "La mesa ya está en el estado solicitado":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                }
            }

        }

        [HttpGet("/Mesas")]
        public async Task<ActionResult> GetTodasLasMesas()
        {
            try
            {
                var mesasConVisita = await _mesasServices.ObtenerTodasLasMesasConVisitaAsync();

                var response = mesasConVisita.Select(t => new MesaDTO
                {
                    Id = t.mesa.Id,
                    Nombre = t.mesa.Nombre,
                    Capacidad = t.mesa.Capacidad,
                    CodigoParaPedir = t.mesa.CodigoParaPedir,
                    x = t.mesa.x,
                    y = t.mesa.y,
                    w = t.mesa.w,
                    h = t.mesa.h,
                    Plano = t.mesa.Plano != null ? new PlanoDTO
                    {
                        Id = t.mesa.Plano.Id,
                        Nombre = t.mesa.Plano.Nombre,
                        Detalles = t.mesa.Plano.Detalles,
                        IdSucursal = t.mesa.Plano.IdSucursal
                    } : null,
                    Visita = t.visita != null ? new VisitaEnMesaDTO
                    {
                        Id = t.visita.Id,
                        IdCaja = t.visita.IdCaja,
                        IdMozo = t.visita.IdMozo ?? Guid.Empty,
                        FechaHora = t.visita.FechaHora,
                        Estado = t.visita.Estado
                    } : null
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorDTO(500, "INTERNAL SERVER ERROR", ex.Message));
            }
        }

        [HttpDelete("/Mesa")]
        public async Task<IActionResult> EliminarMesa([FromQuery] Guid IdMesa)
        {
            try
            {
                var resultado = await _mesasServices.EliminarMesa(IdMesa);
                
                return Ok(new EntregaDTO(200, "DELETED", "Mesa eliminada exitosamente"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Mesa no encontrada":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", ex.Message));
                    case "No se puede eliminar una mesa con visitas activas":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return StatusCode(500, new ErrorDTO(500, "INTERNAL SERVER ERROR", ex.Message));
                }
            }
        }
    }
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

//     else
//    {
//        return BadRequest(new ErrorDTO(400, "BAD REQUEST", "Accion incorrecta"));
//    }

//}

