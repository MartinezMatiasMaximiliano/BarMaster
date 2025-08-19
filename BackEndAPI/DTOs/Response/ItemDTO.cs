using BackEndAPI.Models;

namespace BackEndAPI.DTOs.Response
{
    public class ItemDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Indicaciones { get; set; }
        public decimal Precio { get; set; }
        public Estado Estado { get; set; }
    }
}
