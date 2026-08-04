using Microsoft.AspNetCore.Http;

namespace BackEndAPI.DTOs.Request.Crear
{
    public class CrearProductoDTO
    {
        public string? Codigo { get; set; }
        public string Nombre { get; set; }
        public string? Descripcion { get; set; }
        public decimal PrecioNeto { get; set; }
        public decimal PorcentajeIVA { get; set; }
        public decimal? CostoProduccion { get; set; }
        public bool Activo { get; set; } = true;

        public IEnumerable<Guid> ListaIdCategorias { get; set; } = new List<Guid>();
        public IFormFile? Imagen { get; set; }

    }
}
