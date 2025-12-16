using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;

namespace BackEndAPI.DTOs.Request
{
    public class ModificarPersonaDTO
    {

        public Guid Id { get; set; }
        public string CodigoDeServicio { get; set; } = string.Empty;
        public int idRol { get; set; }
        public string Nombres { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Dni { get; set; } = string.Empty;
        public bool Activo { get; set; } = true;
    }
}
