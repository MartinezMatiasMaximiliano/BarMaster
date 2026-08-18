namespace BackEndAPI.Models
{
    public class StockProductoSucursal
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IdProducto { get; set; }
        public Guid IdSucursal { get; set; }
        public bool ControlaStock { get; set; }
        public int CantidadActual { get; set; }
        public int CantidadMinima { get; set; }
        public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;

        public Producto Producto { get; set; } = null!;
        public Sucursal Sucursal { get; set; } = null!;
        public ICollection<MovimientoStock> Movimientos { get; set; } = new List<MovimientoStock>();
    }
}
