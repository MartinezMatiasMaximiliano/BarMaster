namespace BackEndAPI.Models
{

    public class Opcion
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IdProducto { get; set; }
        public string Nombre { get; set; } = null!;
        public decimal PrecioExtra { get; set; }

        

        //navegacion
        public Producto Producto { get; set; } = null!;

    }
}
