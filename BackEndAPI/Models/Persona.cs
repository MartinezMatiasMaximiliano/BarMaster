using Microsoft.AspNetCore.Identity;

namespace BackEndAPI.Models
{
    public class Persona
    {
        public int Id { get; set; }

        public string Nombres { get; set; } = string.Empty;

        public string Apellido { get; set; } = string.Empty;

        public string Dni { get; set; } = string.Empty;

        public string Direccion { get; set; } = string.Empty;

        public string Telefono { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;

        public string CodigoDeServicio { get; set; } = string.Empty;

        public Rol Rol { get; set; }

        public ICollection<Mesa> Mesas { get; set; }

        public byte[] PasswordHash { get; private set; } //Convierte la contraseña en un codigo aleatorio, para no ser guardada como texto plano en la db.

        public byte[] PasswordSalt { get; private set; } //Agrega valor aleatorio a la contraseña. Sirve para que dos contraseñas iguales no tengan el mismo hash.

        public void EstablecerContrasena(byte[] hashContrasena, byte[] saltContrasena)
        {
            PasswordHash = hashContrasena;
            PasswordSalt = saltContrasena;
        }
    }

}
