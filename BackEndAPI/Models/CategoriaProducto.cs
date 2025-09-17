namespace BackEndAPI.Models
{
    public class CategoriaProducto
    {
        public int Id { get; set; }
        public Guid IdProducto { get; set; }
        public Guid IdCategoria { get; set; }

        //navegacion
        public Producto Producto { get; set; } = null!;
        public Categoria Categoria { get; set; } = null!;
    }
}
