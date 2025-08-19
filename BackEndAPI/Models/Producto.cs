using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackEndAPI.Models
{
    public class Producto
    {
        public int Id { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string Descripcion { get; set; } = string.Empty;

        public decimal Precio { get; set; } = decimal.Zero;

        public bool Activo { get; set; } = true;

        public string PathImagen {  get; set; } = string.Empty;
        
        public List<Categoria> Categorias { get; set; } = new List<Categoria> { };
    }
}
