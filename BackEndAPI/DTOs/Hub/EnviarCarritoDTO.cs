using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace BackEndAPI.DTOs.Hub
{
    public class EnviarCarritoDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string indicaciones { get; set; }
        public float Precio { get; set; }
    }
}
