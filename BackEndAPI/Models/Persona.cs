using Microsoft.AspNetCore.Identity;

namespace BackEndAPI.Models
{
    public class Persona
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public int IdRol { get; set; }
        public Guid IdEmpresa { get; set; }
        public Guid? IdSucursal { get; set; } = null;
        public string Nombres { get; set; } = null!;
        public string Apellido { get; set; } = null!;
        public string? Dni { get; set; } = string.Empty;
        public string? Direccion { get; set; } = string.Empty;
        public string? Telefono { get; set; } = string.Empty;
        public string? Email { get; set; } = string.Empty;  
        public bool Activo { get; set; } = true;
        public string? CodigoDeServicio { get; set; } = string.Empty;

        public byte[] PasswordHash { get; private set; } //Convierte la contraseña en un codigo aleatorio, para no ser guardada como texto plano en la db.
        public byte[] PasswordSalt { get; private set; } //Agrega valor aleatorio a la contraseña. Sirve para que dos contraseñas iguales no tengan el mismo hash.       

        //navegacion
        public Empresa Empresa { get; set; }
        public Sucursal? Sucursal { get; set; }
        public Rol Rol { get; set; } = null!;

        public void EstablecerContrasena(byte[] hashContrasena, byte[] saltContrasena)
        {
            PasswordHash = hashContrasena;
            PasswordSalt = saltContrasena;
        }
    }

}
