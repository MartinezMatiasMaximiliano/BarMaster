using BackEndAPI.Models;

namespace BackEndAPI.DTOs.Request.Crear
{
    public class CrearMesaDTO
    {
        public string Nombre { get; set; } = string.Empty;
        public Guid IdPlano { get; set; } = Guid.Empty;
        public int Capacidad { get; set; } = 0;
        public float x { get; set; } = 0;
        public float y { get; set; } = 0;
        public float w { get; set; } = 0;
        public float h { get; set; } = 0;
        
    }
}
