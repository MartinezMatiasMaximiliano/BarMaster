using Microsoft.AspNetCore.Http;

namespace BackEndAPI.DTOs.Request.Crear
{
    public class CrearProductoDTO
    {
        public string? Codigo { get; set; }
        public string Nombre { get; set; }
        public string? Descripcion { get; set; }
        public decimal Precio { get; set; }
        public decimal? CostoProduccion { get; set; }
        public bool Activo { get; set; } = true;
        public IFormFile? Imagen { get; set; }

    }
}
