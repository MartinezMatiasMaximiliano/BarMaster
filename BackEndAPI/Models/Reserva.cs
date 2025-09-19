namespace BackEndAPI.Models
{
    public class Reserva
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime FechaHora { get; set; }
        public string NombreReserva { get; set; } = null!;
        public int? CantidadDePersonas { get; set; }
        public EstadoReserva Estado { get; set; } = null!;

        //Foreign Keys
        public Guid? IdMesa { get; set; }

        //navegacion
        public Mesa Mesa { get; set; } = null!;
    }
}
