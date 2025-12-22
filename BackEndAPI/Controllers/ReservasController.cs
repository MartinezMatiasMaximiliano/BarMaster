using BackEndAPI.Services.Interfaces;
using BackEndAPI.DTOs.Response;
using BackEndAPI.DTOs.Request.Modificar;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEndAPI.Models;
namespace BackEndAPI.Controllers
{
    //ToDo:[Authorize]
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
    }
}