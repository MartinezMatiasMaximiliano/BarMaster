namespace BackEndAPI.Models
{

    public class Opcion
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombre { get; set; } = null!;
        public decimal PrecioExtra { get; set; }

        // Foreign key
        public Guid IdProducto { get; set; }

        //navegacion
        public Producto Producto { get; set; } = null!;

    }
}
