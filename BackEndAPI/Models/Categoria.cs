using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackEndAPI.Models
{
    public class Categoria
    { 
        public int Id { get; set; }

        [MaxLength(30)]
        public string Nombre { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;

        public List<Producto> Productos { get; set; } = new List<Producto> { };
    }
}
