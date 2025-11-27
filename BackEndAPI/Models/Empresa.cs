using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.Models
{
    public class Empresa
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombre { get; set; } = null!;
        public string[]? Telefonos { get; set; }
        public string[]? Emails { get; set; }
        public bool Activo { get; set; } = false;
        public DateTime FechaInscripcion { get; set; } = DateTime.UtcNow;

        public string Username { get; set; } = null!;
        [Required]
        public byte[] PasswordHash { get; set; }
        [Required]
        public byte[] PasswordSalt { get; set; }

        //Foreign Keys
        public short IdTipoSubscripcion { get; set; }
        public Guid? IdPropietario { get; set; }

        //navegacion
        public Persona? Propietario { get; set; }
        public ICollection<Sucursal> Sucursales { get; set; } = new List<Sucursal>();
        public ICollection<Persona> Personas { get; set; } = new List<Persona>();
        public TipoSubscripcion TipoSubscripcion { get; set; } = null!;

        public void EstablecerContrasena(byte[] hashContrasena, byte[] saltContrasena)
        {
            PasswordHash = hashContrasena;
            PasswordSalt = saltContrasena;
        }
    }
}
//TODO: DECIDIR QUE TIPO DE MODELO USAMOS PARA LA SUBSCRIPCION



