namespace BackEndAPI.Tenancy.Models
{
    public class Tenant
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string NombreEmpresa { get; set; } = null!;
        public string NombreDB { get; set; } = null!;
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public string ConnectionString { get; set; } = null!;

    }
}
