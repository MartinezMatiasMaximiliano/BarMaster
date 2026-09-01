namespace BackEndAPI.Models.Printing;

public sealed class PrintingStation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid IdSucursal { get; set; }
    public Guid ClientInstallationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool Enabled { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastSeenAt { get; set; }
    public DateTime? RevokedAt { get; set; }

    public Sucursal Sucursal { get; set; } = null!;
    public ICollection<PrinterAssignment> Assignments { get; set; } = new List<PrinterAssignment>();
}
