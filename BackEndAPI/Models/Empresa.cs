using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.Models
{
    public class Empresa
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        //public Guid? IdPropietario { get; set; }
        public short IdTipoSubscripcion { get; set; }
        public string Nombre { get; set; } = null!;
        public string[]? Telefonos { get; set; }
        public string[]? Emails { get; set; }
        public bool Activo { get; set; } = false;
        public DateTime FechaInscripcion { get; set; } = DateTime.UtcNow;
        public string Username { get; set; } = null!;
        public byte[] PasswordHash { get; private set; } //Convierte la contraseña en un codigo aleatorio, para no ser guardada como texto plano en la db.
        public byte[] PasswordSalt { get; private set; } //Agrega valor aleatorio a la contraseña. Sirve para que dos contraseñas iguales no tengan el mismo hash.




        //navegacion
        //public Persona? Propietario { get; set; }
        public TipoSubscripcion TipoSubscripcion { get; set; } = null!;
        public ICollection<Sucursal> Sucursales { get; set; } = new List<Sucursal>();
        public ICollection<Persona> Personas { get; set; } = new List<Persona>();



        public void EstablecerContrasena(byte[] hashContrasena, byte[] saltContrasena)
        {
            PasswordHash = hashContrasena;
            PasswordSalt = saltContrasena;
        }
    }
}


