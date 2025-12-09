namespace BackEndAPI.DTOs.Response
{
    public class ProductoDTO
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public decimal Precio { get; set; } = decimal.Zero;
        public bool Activo { get; set; } = true;
        public string ImagenUrl {  get; set; } = string.Empty ;
        public string[]? Categorias { get; set; } = new string[0];
    }
}
