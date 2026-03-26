namespace BackEndAPI.DTOs.Response
{
    public class EmpresaDTO
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombre { get; set; } = null!;
        public string[]? Telefonos { get; set; }
        public string[]? Emails { get; set; }
        public bool Activo { get; set; } = false;
        public DateTime FechaInscripcion { get; set; } = DateTime.UtcNow;
    }

    public class EmpresaConSucursalesDTO
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string[]? Telefonos { get; set; }
        public string[]? Emails { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaInscripcion { get; set; }
        public List<SucursalSimpleDTO> Sucursales { get; set; } = [];
    }

    public class SucursalSimpleDTO
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Direccion { get; set; }
        public string? Telefono { get; set; }
        public string Username { get; set; } = null!;
    }
}
