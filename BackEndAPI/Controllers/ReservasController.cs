using BackEndAPI.Services.Interfaces;
using BackEndAPI.DTOs.Response;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Exceptions;
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
        private static ReservaDTO MappearReservaDTO(Reserva reserva)
        {
            return new ReservaDTO
            {
                Id = reserva.Id,
                FechaHora = reserva.FechaHora,
                NombreReserva = reserva.NombreReserva,
                Estado = new EstadoReservaDTO
                {
                    Id = reserva.Estado.Id,
                    Nombre = reserva.Estado.Nombre
                },
                TelefonoContacto = reserva.Telefono,
                CantidadDePersonas = reserva.CantidadDePersonas
            };
        }

        [HttpGet("/Reservas")]
        public async Task<IActionResult> GetReservas()
        {
            var reservas = await _ReservasServices.BuscarReservas();
            return Ok(reservas.Select(MappearReservaDTO).ToList());
        }

        [HttpGet("/Reservas/Fechas")]
        public async Task<IActionResult> GetReservasPorRangoFechas([FromQuery] DateTime Desde, [FromQuery] DateTime? Hasta)
        {
            var idSucursal = ObtenerIdSucursal();
            var reservas = await _ReservasServices.BuscarReservasPorRangoFechas(idSucursal, Desde, Hasta);
            return Ok(reservas.Select(MappearReservaDTO).ToList());
        }

        [HttpPost("/Reservas")]
        public async Task<IActionResult> CrearReserva([FromBody] CrearReservaDTO request)
        {
            var idSucursal = ObtenerIdSucursal();
            var nuevaReserva = await _ReservasServices.CrearReserva(request, idSucursal);
           return Ok(MappearReservaDTO(nuevaReserva));
        }

        [HttpPut("/Reservas")]
        public async Task<IActionResult> ModificarReserva(ModificarReservaDTO DTO) {
            await _ReservasServices.ActualizarReserva(DTO);
            return Ok(new EntregaDTO(200, "OK", $"Modificado exitosamente, Id:{DTO.Id}"));
        }

        [HttpDelete("/Reservas")]
        public async Task<IActionResult> EliminarReserva(Guid Id)
        {
            await _ReservasServices.EliminarReserva(Id);
            return Ok(new EntregaDTO(200, "OK", $"Eliminado exitosamente, Id:{Id}"));
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
