namespace BackEndAPI.DTOs.Response
{
    public class PlanoDTO
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Detalles { get; set; }
        public Guid IdSucursal { get; set; }
    }
}

