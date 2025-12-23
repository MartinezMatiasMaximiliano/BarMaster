using BackEndAPI.Models;

namespace BackEndAPI.DTOs.Response
{
    public class ReservaDTO
    {
        public Guid Id { get; set; }
        public DateTime FechaHora { get; set; }
        public string NombreReserva { get; set; } = string.Empty;
        public int? CantidadDePersonas { get; set; }

        public string Estado { get; set; } = null!;
    }
}
