using BackEndAPI.Models;

namespace BackEndAPI.DTOs.Response
{
    public class ReservaDTO
    {
        public Guid Id { get; set; }
        public DateTime FechaHora { get; set; }
        public string NombreReserva { get; set; } = string.Empty;
        public string TelefonoContacto { get; set; } = string.Empty;
        public int? CantidadDePersonas { get; set; }

        public EstadoReservaDTO Estado { get; set; } = null!;
    }
}
