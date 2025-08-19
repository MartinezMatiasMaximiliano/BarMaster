using BackEndAPI.Models;

namespace BackEndAPI.DTOs.Response
{
    public class PedidoDTO
    {
        public int Id { get; set; }
        public DateTime FechaRealizado { get; set; } = DateTime.Now;
        public int IdMesa { get; set; } 
        public int NumeroMesa { get; set; }
        public bool Activo { get; set; }
        public List<ItemDTO> Items { get; set; } = new List<ItemDTO>();  
    }
}
