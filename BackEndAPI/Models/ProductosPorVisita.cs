namespace BackEndAPI.Models
{
    public class ProductosPorVisita
    {
        public int Id { get; set; }
        public Guid IdVisita { get; set; }
        public Guid? IdProducto { get; set; }
        public Guid? IdMovimientoCaja { get; set; } = null;
        public string NombreProducto { get; set; } = null!;
        public string? Detalles { get; set; }
        public decimal PrecioDelMomento { get; set; }
        public bool EstadoPagado { get; set; } = false;
        public DateTime FechaAgregado { get; set; } = DateTime.UtcNow;
        public string EstadoPedido { get; set; } = "Pendiente";

        //navegacion
        public Visita Visita { get; set; } = null!;
        public Producto? Producto { get; set; } = null!; 
    }
}
