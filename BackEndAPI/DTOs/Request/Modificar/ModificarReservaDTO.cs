namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ModificarReservaDTO
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        [System.ComponentModel.DataAnnotations.Range(2, 3, ErrorMessage = "El estado de la reserva debe ser Confirmada o Cancelada.")]
        public int IdEstadoReserva { get; set; } 
        public string Telefono { get; set; } = string.Empty;
        public DateTimeOffset FechaHora { get; set; }
        public string NombreReserva { get; set; } = string.Empty;
        public int? CantidadDePersonas { get; set; }
        // Omitir conserva la mesa; null quita la asignación.
        private Guid? _idMesa;
        public Guid? IdMesa { get => _idMesa; set { _idMesa = value; MesaEspecificada = true; } }
        [System.Text.Json.Serialization.JsonIgnore]
        public bool MesaEspecificada { get; private set; }

    }
}
