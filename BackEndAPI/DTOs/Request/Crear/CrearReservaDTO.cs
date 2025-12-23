namespace BackEndAPI.DTOs.Request.Crear
{
    public class CrearReservaDTO
    {
        public int IdEstadoReserva { get; set; }
        public DateTime FechaHora { get; set; }
        public string NombreReserva { get; set; } = string.Empty;
        public int? CantidadDePersonas { get; set; }
    }
}

