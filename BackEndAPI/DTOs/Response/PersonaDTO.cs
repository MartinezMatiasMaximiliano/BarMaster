using BackEndAPI.Models;

namespace BackEndAPI.DTOs.Response
{
    public class PersonaDTO
    {
        public int Id { get; set; }
        public string CodigoDeServicio { get; set; }
        public Rol Rol { get; set; }
        public DatosPersonales DatosPersonales { get; set; }
    }

    public class DatosPersonales
    {
        public string Nombres { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Dni {  get; set; } = string.Empty;
        public bool Activo { get; set; } = true;
    }
}
