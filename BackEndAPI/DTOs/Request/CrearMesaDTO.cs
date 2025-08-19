using BackEndAPI.Models;

namespace BackEndAPI.DTOs.Request
{
    public class CrearMesaDTO
    {
        public int NumeroMesa { get; set; } = -1;
        public int? MozoId { get; set; } = -1;
    }
}
