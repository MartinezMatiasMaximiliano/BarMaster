namespace BackEndAPI.Models
{
    public class Menu
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombre { get; set; } = null!;
        public bool Activo { get; set; } = true;

        //foreign key
        public Guid IdSucursal { get; set; }

        //navegacion
        public Sucursal Sucursal { get; set; } = null!;
        public ICollection<Producto> Productos { get; set; } = new List<Producto>();
    }
}
