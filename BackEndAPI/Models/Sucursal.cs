using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.Models
{
    public class Sucursal
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombre { get; set; } = null!;
        public string Direccion { get; set; } = null!;
        public string Telefono { get; set; } = null!;

        public string Username { get; set; } = null!;  
        [Required]
        public byte[] PasswordHash { get; set; }
        [Required]
        public byte[] PasswordSalt { get; set; }

        //Foreign Key
        public Guid? IdEncargado { get; set; }
        public Guid IdEmpresa { get; set; }

        //navegacion
        public Empresa Empresa { get; set; } = null!;
        public Persona? Encargado { get; set; } 
        public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
        public ICollection<Menu> Menus { get; set; } = new List<Menu>();
        public ICollection<Caja> Cajas { get; set; } = new List<Caja>();
        public ICollection<Persona> Personas { get; set; } = new List<Persona>();
        public ICollection<Plano> PlanosMesas { get; set; } = new List<Plano>();

        public void EstablecerContrasena(byte[] hashContrasena, byte[] saltContrasena)
        {
            PasswordHash = hashContrasena;
            PasswordSalt = saltContrasena;
        }
    }
}
