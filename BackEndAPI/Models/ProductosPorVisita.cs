namespace BackEndAPI.Models
{
    public class ProductosPorVisita
    {
        public int Id { get; set; }
        public Guid IdVisita { get; set; }
        public Guid? IdProducto { get; set; }
        //public Guid? IdPago { get; set; } = null; TODO:
        public string NombreProducto { get; set; } = null!;
        public string? Detalles { get; set; }
        public decimal PrecioDelMomento { get; set; }
        public bool EstadoPagado { get; set; } = false;
        public DateTime FechaAgregado { get; set; } = DateTime.Now;
        public string EstadoPedido { get; set; } = "Creado";

        //navegacion
        public Visita Visita { get; set; } = null!;
        public Producto? Producto { get; set; } = null!; 
    }
}
