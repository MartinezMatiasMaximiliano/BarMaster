namespace BackEndAPI.DTOs.Request
{
    public class CrearProductoDTO
    {
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public decimal Precio { get; set; }
        public bool Activo { get; set; } = true;
        public string[] Categorias { get; set; }
        public IFormFile? Imagen { get; set; }
    }
}
