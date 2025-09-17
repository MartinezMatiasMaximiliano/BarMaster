namespace BackEndAPI.Models
{
    public class Reserva
    {
        public Guid Id { get; set; }
        public Guid IdMesa { get; set; }
        public DateTime FechaHora { get; set; }
        public string NombreCliente { get; set; } = null!;
        public int CantidadPersonas { get; set; }
        public EstadoReserva Estado { get; set; } = null!;

        public Mesa Mesa { get; set; } = null!;
    }
}
