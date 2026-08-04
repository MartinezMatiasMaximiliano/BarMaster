namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ModificarProductoDTO
    {
        public Guid IdProducto { get; set; }
        public string? Codigo { get; set; }
        public string? Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; } = string.Empty;
        public decimal? PrecioNeto { get; set; } = -1;
        public decimal? PorcentajeIVA { get; set; } = -1;
        public decimal? CostoProduccion { get; set; }
        public bool? Activo { get; set; } = true;
        public IEnumerable<Guid>? categorias { get; set; } = new List<Guid>();
        public IFormFile? Imagen { get; set; } = null;
    }
}
