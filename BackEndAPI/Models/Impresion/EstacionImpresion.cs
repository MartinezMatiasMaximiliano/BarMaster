namespace BackEndAPI.Models.Impresion;

public sealed class EstacionImpresion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid IdSucursal { get; set; }
    public Guid IdInstalacionCliente { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public bool Habilitada { get; set; } = true;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    public DateTime? VistaPorUltimaVezEn { get; set; }
    public DateTime? RevocadaEn { get; set; }
    public string? HashCredencial { get; set; }
    public DateTime? CredencialCreadaEn { get; set; }
    public string? UltimaVersionAgente { get; set; }
    public string? UltimaVersionQz { get; set; }
    public Sucursal Sucursal { get; set; } = null!;
    public ICollection<Impresora> Impresoras { get; set; } = new List<Impresora>();
    public ICollection<TrabajoImpresion> TrabajosImpresion { get; set; } = new List<TrabajoImpresion>();
}
