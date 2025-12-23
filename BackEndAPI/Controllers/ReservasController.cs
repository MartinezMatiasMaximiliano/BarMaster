using BackEndAPI.Services.Interfaces;
using BackEndAPI.DTOs.Response;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEndAPI.Models;
namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class ReservasController : ControllerBase
    {
        private readonly IReservasServices _ReservasServices;
           
        public ReservasController(IReservasServices _reservasServices)
        {
            _ReservasServices = _reservasServices;
        }

        [HttpGet("/Reservas")]
        public async Task<IActionResult> GetReservas()
        {
            try
            {
                var reservas = await _ReservasServices.BuscarReservas();
                var ListaReservas = reservas.Select(reserva => new ReservaDTO
                //ToDo: agregar la sucursal y estadoreserva en el DTO 
                {
                    Id = reserva.Id,
                    FechaHora = reserva.FechaHora,
                    NombreReserva = reserva.NombreReserva,
                    Estado = reserva.Estado.Nombre,
                    CantidadDePersonas = reserva.CantidadDePersonas
                }).ToList();

                return Ok(ListaReservas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error Interno de servidor: " + ex.Message);
            }
        }

        [HttpPost("/Reservas")]
        public async Task<IActionResult> CrearReserva([FromBody] CrearReservaDTO request)
        {
            try
            {
                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;

                if (IdSucursal == Guid.Empty)
                {
                    throw new Exception("Sucursal no identificada");
                }

                var nuevaReserva = await _ReservasServices.CrearReserva(request, IdSucursal);
                var reservaDTO = new ReservaDTO
                {
                    Id = nuevaReserva.Id,
                    FechaHora = nuevaReserva.FechaHora,
                    NombreReserva = nuevaReserva.NombreReserva,
                    CantidadDePersonas = nuevaReserva.CantidadDePersonas,
                    Estado = nuevaReserva.Estado.Nombre
                };
                return Ok(reservaDTO);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El nombre de la reserva es obligatorio":
                        return BadRequest(ex.Message);
                    case "Sucursal no identificada":
                        return BadRequest(ex.Message);
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }

        [HttpPut("/Reservas")]
        public async Task<IActionResult> ModificarReserva(ModificarReservaDTO DTO) {
            try
            {
                var reserva = await _ReservasServices.ActualizarReserva(DTO);
                return Ok(new EntregaDTO(200, "OK", $"Modificado exitosamente, Id:{DTO.Id}"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Reserva no encontrada":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", $"No existe la reserva buscada"));
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }

        [HttpDelete("/Reservas")]
        public async Task<IActionResult> EliminarReserva(Guid Id)
        {
            try
            {
                await _ReservasServices.EliminarReserva(Id);
                return Ok(new EntregaDTO(200, "OK", $"Eliminado exitosamente, Id:{Id}"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Reserva no encontrada":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", $"No existe la reserva buscada"));
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }
    }
}