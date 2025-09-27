using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Policy;

namespace BackEndAPI.Models
{
    public class Producto
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string? Codigo { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public decimal Precio { get; set; }
        public decimal? Costo { get; set; }
        public bool Activo { get; set; } = true;
        public string PathImagen { get; set; } = string.Empty;

        //Foreign Keys
        public Guid IdEmpresa { get; set; }

        //navegacion
        public Empresa Empresa { get; set; } = null!;
        public ICollection<Menu> Menus { get; set; } = new List<Menu>();
        public ICollection<Categoria> Categorias { get; set; } = new List<Categoria>();
        public ICollection<Opcion> Opciones { get; set; } = new List<Opcion>();

    }
}
