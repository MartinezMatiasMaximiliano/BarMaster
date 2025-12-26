namespace BackEndAPI.DTOs.Request.Crear
{
    public class CrearEmpresaDTO
    {
        public string Nombre { get; set; } = null!; 
        public string[]? Telefonos { get; set; }
        public string[]? Emails { get; set; }
        public string Password { get; set; } = null!;   
    }
}
