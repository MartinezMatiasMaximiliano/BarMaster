namespace BackEndAPI.Models
{
    public class ProductosPorVisita
    {
        public int Id { get; set; }
        public string NombreProducto { get; set; } = null!;
        public string? Detalles { get; set; }
        public double PrecioDelMomento { get; set; }
        public int Cantidad { get; set; }
        public double PrecioTotal { get; set; }

        //Foreign keys
        public Guid IdVisita { get; set; }

        //navegacion
        public Visita Visita { get; set; } = null!;
    }
}
