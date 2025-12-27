using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.Models
{
    public class Sucursal
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IdEmpresa { get; set; }
        //public Guid? IdEncargado { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Direccion { get; set; }
        public string? Telefono { get; set; } 
        public string Username { get; set; } = null!;

        public byte[] PasswordHash { get; private set; } //Convierte la contraseña en un codigo aleatorio, para no ser guardada como texto plano en la db.
        public byte[] PasswordSalt { get; private set; } //Agrega valor aleatorio a la contraseña. Sirve para que dos contraseñas iguales no tengan el mismo hash.



        //navegacion
        public Empresa Empresa { get; set; } = null!;
        public ICollection<Plano> Planos { get; set; } = new List<Plano>();
        public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
        public ICollection<Menu> Menus { get; set; } = new List<Menu>();
        public ICollection<Caja> Cajas { get; set; } = new List<Caja>();
        public ICollection<Delivery> Deliveries { get; set; } = new List<Delivery>();

        //public ICollection<Persona> Personas { get; set; } = new List<Persona>();
        //public Persona? Encargado { get; set; } 

        public void EstablecerContrasena(byte[] hashContrasena, byte[] saltContrasena)
        {
            PasswordHash = hashContrasena;
            PasswordSalt = saltContrasena;
        }
    }
}
