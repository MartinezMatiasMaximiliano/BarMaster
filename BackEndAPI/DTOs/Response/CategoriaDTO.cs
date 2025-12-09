namespace BackEndAPI.DTOs.Response
{
    public class CategoriaDTO
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public bool Activo { get; set; } = true;
    }
}
