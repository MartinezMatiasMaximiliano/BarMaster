namespace BackEndAPI.Models
{
    public class Visita
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IdCaja { get; set; }
        public Guid? IdMozo { get; set; } = null;
        public Guid? IdMesa { get; set; } = null;
        public DateTime FechaHora { get; set; } = DateTime.UtcNow;
        public decimal Total { get; set; }
        public string Estado { get; set; } = null!;
        public string Origen { get; set; } = null!; 


        //navegacion
        public Caja Caja { get; set; } = null!;
        public Persona? Mozo { get; set; }
        public Mesa? Mesa { get; set; } = null!;
        public ICollection<ProductosPorVisita> Productos { get; set; } = new List<ProductosPorVisita>();
        public ICollection<MovimientoCaja> Pagos { get; set; } = new List<MovimientoCaja>();
    }
}
