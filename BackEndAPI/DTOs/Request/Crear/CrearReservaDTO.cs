namespace BackEndAPI.DTOs.Request.Crear
{
    public class CrearReservaDTO
    {
        [System.ComponentModel.DataAnnotations.Range(2, 3, ErrorMessage = "El estado de la reserva debe ser Confirmada o Cancelada.")]
        public int IdEstadoReserva { get; set; } = 2;
        public DateTimeOffset FechaHora { get; set; }
        public string Telefono { get; set; }
        public string NombreReserva { get; set; } = string.Empty;
        public int? CantidadDePersonas { get; set; }
        public Guid? IdMesa { get; set; }
    }
}

