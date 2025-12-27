using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.Models
{
    public class Empresa
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public short? IdTipoSubscripcion { get; set; }
        public string Nombre { get; set; } = null!;
        public string[]? Telefonos { get; set; } = null;
        public string[]? Emails { get; set; } = null;
        public DateTime FechaInscripcion { get; set; } = DateTime.UtcNow;
        public bool Activo { get; set; } = false;
        public string Username { get; set; } = null!;
        public byte[] PasswordHash { get; private set; } 
        public byte[] PasswordSalt { get; private set; } 

        //navegacion
        public TipoSubscripcion? TipoSubscripcion { get; set; } = null!;
        public ICollection<Sucursal> Sucursales { get; set; } = new List<Sucursal>();
        public ICollection<Persona> Personas { get; set; } = new List<Persona>();


        public void EstablecerContrasena(byte[] hashContrasena, byte[] saltContrasena)
        {
            PasswordHash = hashContrasena;
            PasswordSalt = saltContrasena;
        }
    }
}


