namespace BackEndAPI.Models.Impresion;

public sealed class TrabajoImpresion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid IdSolicitud { get; set; }
    public Guid IdSucursal { get; set; }
    public Guid IdEstacion { get; set; }
    public Guid IdImpresora { get; set; }
    public Guid? IdRegla { get; set; }
    public Guid? IdPersonaSolicitante { get; set; }
    public Guid? IdTrabajoReimpreso { get; set; }
    public TipoDocumentoImpresion TipoDocumento { get; set; }
    public short VersionEsquema { get; set; } = 1;
    public short VersionPlantilla { get; set; } = 1;
    public string ContenidoJson { get; set; } = "{}";
    public string NombreSistemaImpresora { get; set; } = string.Empty;
    public FormatoImpresion Formato { get; set; } = FormatoImpresion.Crudo;
    public short AnchoPapelMm { get; set; } = 58;
    public string Codificacion { get; set; } = "CP858";
    public short Copias { get; set; } = 1;
    public EstadoTrabajoImpresion Estado { get; set; } = EstadoTrabajoImpresion.Pendiente;
    public string ClaveIdempotencia { get; set; } = string.Empty;
    public string TipoEntidadOrigen { get; set; } = string.Empty;
    public string IdEntidadOrigen { get; set; } = string.Empty;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    public DateTime DisponibleEn { get; set; } = DateTime.UtcNow;
    public DateTime VenceEn { get; set; }
    public Guid? IdReserva { get; set; }
    public DateTime? ReservaVenceEn { get; set; }
    public DateTime? EnvioIniciadoEn { get; set; }
    public DateTime? AceptadoPorColaEn { get; set; }
    public short CantidadIntentos { get; set; }
    public string? UltimoCodigoError { get; set; }
    public string? UltimoDetalleError { get; set; }
    public Sucursal Sucursal { get; set; } = null!;
    public EstacionImpresion Estacion { get; set; } = null!;
    public Impresora Impresora { get; set; } = null!;
    public ReglaImpresion? Regla { get; set; }
    public TrabajoImpresion? TrabajoReimpreso { get; set; }
}
