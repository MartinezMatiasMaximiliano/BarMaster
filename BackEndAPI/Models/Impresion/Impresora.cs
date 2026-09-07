namespace BackEndAPI.Models.Impresion;

public sealed class Impresora
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid IdEstacion { get; set; }
    public string NombreSistema { get; set; } = string.Empty;
    public string NombreSistemaNormalizado { get; set; } = string.Empty;
    public string NombreVisible { get; set; } = string.Empty;
    public FormatoImpresion Formato { get; set; } = FormatoImpresion.Crudo;
    public short AnchoPapelMm { get; set; } = 58;
    public string Codificacion { get; set; } = "CP858";
    public bool Habilitada { get; set; } = true;
    public bool Presente { get; set; } = true;
    public DateTime VistaPorUltimaVezEn { get; set; } = DateTime.UtcNow;
    public string? UltimoEstado { get; set; }
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;
    public EstacionImpresion Estacion { get; set; } = null!;
    public ICollection<ReglaImpresion> Reglas { get; set; } = new List<ReglaImpresion>();
    public ICollection<TrabajoImpresion> Trabajos { get; set; } = new List<TrabajoImpresion>();
}
