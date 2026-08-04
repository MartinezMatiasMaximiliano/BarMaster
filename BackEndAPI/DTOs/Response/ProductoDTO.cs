namespace BackEndAPI.DTOs.Response
{
    public class ProductoDTO
    {
        public Guid Id { get; set; }
        /// <summary>Código del producto. Opcional.</summary>
        public string? Codigo { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public decimal PrecioNeto { get; set; } = decimal.Zero;
        public decimal PorcentajeIVA { get; set; } = decimal.Zero;
        public decimal? CostoProduccion { get; set; }
        public bool Activo { get; set; } = true;
        public string ImagenUrl {  get; set; } = string.Empty ;
        public string[]? Categorias { get; set; } = new string[0];
    }
}
