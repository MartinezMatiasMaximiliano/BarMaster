using Microsoft.AspNetCore.Identity;

namespace BackEndAPI.Models
{
    public class Persona
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombres { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string? Dni { get; set; } = string.Empty;
        public string? Direccion { get; set; } = string.Empty;
        public string? Telefono { get; set; } = string.Empty;
        public string? Email { get; set; } = string.Empty;  
        public bool Activo { get; set; } = true;
        public string? CodigoDeServicio { get; set; } = string.Empty;

        public byte[] PasswordHash { get; private set; } //Convierte la contraseña en un codigo aleatorio, para no ser guardada como texto plano en la db.
        public byte[] PasswordSalt { get; private set; } //Agrega valor aleatorio a la contraseña. Sirve para que dos contraseñas iguales no tengan el mismo hash.

        //Foreign Keys
        public int IdRol { get; set; }
        public Guid IdEmpresa { get; set; }

        //navegacion
        public Rol Rol { get; set; } = null!;
        public Empresa EmpresaEmpleado { get; set; } = null!;
        public Empresa? EmpresaPropietario { get; set; } //Si la persona es propietario de una empresa
        public IEnumerable<Sucursal> Sucursales { get; set; } = new List<Sucursal>();
        public ICollection<Mesa>? Mesas { get; set; } = new List<Mesa>();

        public void EstablecerContrasena(byte[] hashContrasena, byte[] saltContrasena)
        {
            PasswordHash = hashContrasena;
            PasswordSalt = saltContrasena;
        }
    }

}
