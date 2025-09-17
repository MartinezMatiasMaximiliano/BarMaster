namespace BackEndAPI.Models
{

    public class Opcion
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public decimal PrecioExtra { get; set; }
        public Guid IdProducto { get; set; }

        //navegacion
        public Producto Producto { get; set; } = null!;

    }
}
