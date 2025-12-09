namespace BackEndAPI.DTOs.Request
{
    public class CrearEmpresaDTO
    {
        public string Nombre { get; set; } = null!; 
        public string[]? Telefonos { get; set; }
        public string[]? Emails { get; set; }
        public Guid IdPropietario { get; set; }
    }



    public class ActualizarEmpresaDTO
    {
        public string? Nombre { get; set; }
        public string? Telefono { get; set; }
        public string? Email { get; set; }
        public bool? Activo { get; set; } = false;
    }
    public class EmpresaResponseDTO
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombre { get; set; } = null!;
        public string[]? Telefonos { get; set; }
        public string[]? Emails { get; set; }
        public bool Activo { get; set; } = false;
        public DateTime FechaInscripcion { get; set; } = DateTime.UtcNow;
    }
}
