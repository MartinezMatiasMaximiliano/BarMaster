namespace BackEndAPI.Models
{
    public class Pago
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public int IdMovimientoCaja { get; set; }
        public Guid IdVisita { get; set; }
        public decimal Monto { get; set; }
        public DateTime FechaHora { get; set; } = DateTime.UtcNow;

        //navegacion
        public TipoMovimientoCaja TipoMovimientoPago { get; set; } = null!;
        public Visita Visita { get; set; } = null!;
    }
}
