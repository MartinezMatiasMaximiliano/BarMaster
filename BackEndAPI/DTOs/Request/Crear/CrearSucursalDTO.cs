namespace BackEndAPI.DTOs.Request.Crear
{
    public class CrearSucursalDTO
    {
        public string Nombre { get; set; } = null!;
        public string Direccion { get; set; } = null!;
        public string? Telefono { get; set; } = null!;
        public string Username { get; set; } = null!; 
        public string Password { get; set; } = null!;

    }
}
