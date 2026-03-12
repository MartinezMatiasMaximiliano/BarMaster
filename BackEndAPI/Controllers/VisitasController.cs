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
                    Total = visitaBuscada.Total,
                    Origen = visitaBuscada.Origen,
                    IdMesa = visitaBuscada.Mesa?.Id,
                    NumeroMesa = visitaBuscada.Mesa?.Nombre,
                    ProductosConsumidos = visitaBuscada.Productos.Select(item => new ItemDTO
                    {
                        Id = item.Id,
                        IdProducto = item.IdProducto,
                        Nombre = item.NombreProducto,
                        Indicaciones = item.Detalles,
                        Precio = item.PrecioDelMomento,
                        EstadoPagado = item.EstadoPagado,
                        EstadoPedido = item.EstadoPedido,
                        FechaAgregado = item.FechaAgregado,
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
                
                var response = new VisitaResponseDTO
                {
                    Id = visitaActualizada.Id,
                    FechaHora = visitaActualizada.FechaHora,
                    Estado = visitaActualizada.Estado,
                    Total = visitaActualizada.Total,
                    Origen = visitaActualizada.Origen,
                    ProductosConsumidos = visitaActualizada.Productos.Select(item => new ItemDTO
                    {
                        Id = item.Id,
                        IdProducto = item.IdProducto,
                        Nombre = item.NombreProducto,
                        Indicaciones = item.Detalles,
                        Precio = item.PrecioDelMomento,
                        EstadoPagado = item.EstadoPagado,
                        EstadoPedido = item.EstadoPedido,
                        FechaAgregado = item.FechaAgregado,
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