namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ModificarProductoDTO
    {
        public Guid IdProducto { get; set; }
        /// <summary>Código del producto. Si se envía, actualiza el valor.</summary>
        public string? Codigo { get; set; }
        public string? Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; } = string.Empty;
        public decimal? Precio { get; set; } = -1;
        /// <summary>Costo de producción. Si se envía, actualiza el valor; si no se envía, se mantiene el actual.</summary>
        public decimal? CostoProduccion { get; set; }
        public bool? Activo { get; set; } = true;
        public IEnumerable<Guid>? categorias { get; set; } = new List<Guid>();
        public IFormFile? Imagen { get; set; } = null;
    }
}
