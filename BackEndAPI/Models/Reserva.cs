namespace BackEndAPI.Models
{
    public class Reserva
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IdSucursal { get; set; }
        public int IdEstadoReserva { get; set; } 
        public DateTime FechaHora { get; set; }
        public string NombreReserva { get; set; } = null!;
        public int? CantidadDePersonas { get; set; }

        

        //navegacion
        public Sucursal Sucursal { get; set; } = null!;
        public EstadoReserva Estado { get; set; } = null!;
    }
}
