using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Models
{
    public class Mesa
    {
        public int Id { get; set; }
        public int NumeroMesa { get; set; }
        public string? CodigoParaPedir { get; set; } = null;
        public Persona? Persona { get; set; } = null;
    }
}
