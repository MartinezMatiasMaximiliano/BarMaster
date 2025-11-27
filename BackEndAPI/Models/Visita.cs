namespace BackEndAPI.Models
{
    public class Visita
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime FechaHora { get; set; } = DateTime.UtcNow;
        public decimal Total { get; set; }
        public string Estado { get; set; } = null!;

        //Foreign keys
        public Guid IdMesa { get; set; }
        public Guid IdCaja { get; set; }
        public Guid? IdMozo { get; set; } = null;

        //navegacion
        public Mesa Mesa { get; set; } = null!;
        public Caja Caja { get; set; } = null!;
        public Persona? Mozo { get; set; }
        public ICollection<ProductosPorVisita> ProductosPorVisita { get; set; } = new List<ProductosPorVisita>();
        public ICollection<Pago> Pagos { get; set; } = new List<Pago>();
    }
}
