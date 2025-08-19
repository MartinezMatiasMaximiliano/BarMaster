namespace BackEndAPI.DTOs.Request
{
    public class CrearCategoriaDTO
    {
        public string Nombre { get; set; } = string.Empty;
        public bool Activo { get; set; } = true;
    }
}
