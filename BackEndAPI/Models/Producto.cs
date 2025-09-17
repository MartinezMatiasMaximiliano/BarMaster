using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackEndAPI.Models
{
    public class Producto
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public decimal Precio { get; set; }

        public bool Activo { get; set; } = true;

        public string PathImagen { get; set; } = string.Empty;

        //navegacion
        public ICollection<MenuProducto> MenuProductos { get; set; } = new List<MenuProducto>();
        public ICollection<CategoriaProducto> CategoriaProductos { get; set; } = new List<CategoriaProducto>();
        public ICollection<Opcion> Opciones { get; set; } = new List<Opcion>();

    }
}
