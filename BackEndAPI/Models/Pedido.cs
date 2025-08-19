using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.Models
{
    public class Pedido
    {
        public int Id { get; set; }
        public Mesa Mesa { get; set; } = new Mesa();
        public DateTime FechaRealizado { get; set; } = DateTime.UtcNow;
        public bool Activo { get; set; }
        public List<Item> Items { get; set; } = null; 
    }
}

    