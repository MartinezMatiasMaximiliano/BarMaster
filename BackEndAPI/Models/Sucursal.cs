namespace BackEndAPI.Models
{
    public class Sucursal
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Direccion { get; set; } = null!;
        public string Telefono { get; set; } = null!;
        public string Password { get; set; } = null!;

        //Foreign Key
        public Guid IdEmpresa { get; set; }

        //navegacion
        public Empresa Empresa { get; set; } = null!;
        public ICollection<Menu> Menus { get; set; } = new List<Menu>();
        public ICollection<Mesa> Mesas { get; set; } = new List<Mesa>();
        public ICollection<Caja> Cajas { get; set; } = new List<Caja>();
        public ICollection<Persona> Personas { get; set; } = new List<Persona>();

    }
}
