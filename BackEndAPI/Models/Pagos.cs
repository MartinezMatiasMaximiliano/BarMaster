namespace BackEndAPI.Models
{
    public class Pagos
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public decimal Monto { get; set; }
        public DateTime FechaHora { get; set; } = DateTime.UtcNow;


        //Foreign keys
        public Guid IdVisita { get; set; }
        public int IdTipoPago { get; set; }

        //navegacion
        public Visita Visita { get; set; } = null!;
        public TipoPago TipoPago { get; set; } = null!;
    }
}
