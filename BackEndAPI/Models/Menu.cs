namespace BackEndAPI.Models
{
    public class Menu
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public bool Activo { get; set; }
        public Guid IdSucursal { get; set; }


        //navegacion
        public Sucursal Sucursal { get; set; } = null!;
        public ICollection<MenuProducto> MenuProductos { get; set; } = new List<MenuProducto>();
    }
}
