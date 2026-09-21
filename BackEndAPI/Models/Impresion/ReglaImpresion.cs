namespace BackEndAPI.Models.Impresion;

public sealed class ReglaImpresion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid IdSucursal { get; set; }
    public Guid IdImpresora { get; set; }
    public TipoSalidaImpresion TipoSalida { get; set; }
    public MomentoImpresion Momento { get; set; }
    public bool Habilitada { get; set; } = true;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;
    public Sucursal Sucursal { get; set; } = null!;
    public Impresora Impresora { get; set; } = null!;
    public ICollection<TrabajoImpresion> Trabajos { get; set; } = new List<TrabajoImpresion>();
}
