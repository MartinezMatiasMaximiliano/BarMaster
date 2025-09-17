using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackEndAPI.Models
{
    public class Categoria
    { 
        public Guid Id { get; set; }

        [MaxLength(30)]
        public string Nombre { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;

        //navegacion
        public ICollection<CategoriaProducto> CategoriaProductos { get; set; } = new List<CategoriaProducto>();
    }
}
