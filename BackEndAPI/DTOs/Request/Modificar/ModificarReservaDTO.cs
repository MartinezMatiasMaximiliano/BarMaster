namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ModificarReservaDTO
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public int IdEstadoReserva { get; set; } 
        public DateTime FechaHora { get; set; }
        public string NombreReserva { get; set; } = string.Empty;
        public int? CantidadDePersonas { get; set; }

    }
}
