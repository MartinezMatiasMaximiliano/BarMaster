namespace BackEndAPI.Models
{
    public class Visita
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime FechaHora { get; set; } = DateTime.UtcNow;
        public decimal Total { get; set; }
        public string Estado { get; set; } = null!;

        public Guid IdMesa { get; set; }
        public Guid IdCaja { get; set; }

        //navegacion
        public Mesa Mesa { get; set; } = null!;
        public Caja Caja { get; set; } = null!;
        public ICollection<ProductosPorVisita> ProductosPorVisita { get; set; } = new List<ProductosPorVisita>();
    }
}
