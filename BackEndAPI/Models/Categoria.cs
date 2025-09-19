using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackEndAPI.Models
{
    public class Categoria
    { 
        public Guid Id { get; set; } = Guid.NewGuid();
        [MaxLength(30)]
        public string Nombre { get; set; } = null!;
        public bool Activo { get; set; } = true;
    }
}
