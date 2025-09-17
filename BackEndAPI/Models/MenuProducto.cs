namespace BackEndAPI.Models
{
    public class MenuProducto
    {
        public int Id { get; set; }
        public Guid IdMenu { get; set; }
        public Guid IdProducto { get; set; }

        //navegacion
        public Menu Menu { get; set; } = null!;
        public Producto Producto { get; set; } = null!;
    }
}
