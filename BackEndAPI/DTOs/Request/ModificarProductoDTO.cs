namespace BackEndAPI.DTOs.Request
{
    public class ModificarProductoDTO
    {

        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public decimal Precio { get; set; } = -1;
        public bool Activo { get; set; } = true;
        public string[] categorias { get; set; } = new string[0];
        public IFormFile? Imagen { get; set; } = null;
    }
}
