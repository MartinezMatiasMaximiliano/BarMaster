namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ModificarProductoDTO
    {
        public Guid IdProducto { get; set; }
        public string? Codigo { get; set; }
        public string? Nombre { get; set; }
        public string? Descripcion { get; set; }
        public decimal? PrecioNeto { get; set; }
        public decimal? PorcentajeIVA { get; set; }
        public decimal? CostoProduccion { get; set; }
        public bool? Activo { get; set; }
        public IEnumerable<Guid>? categorias { get; set; }
        public IFormFile? Imagen { get; set; } = null;
    }
}
