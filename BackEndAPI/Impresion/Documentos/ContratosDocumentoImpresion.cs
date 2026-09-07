using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.Impresion.Documentos;

public sealed record ImprimirPreticketSolicitud(
    Guid IdComando,
    Guid IdVisita,
    IReadOnlyList<int>? IdsProductos);

public sealed record LineaPreticketContenido(
    int Cantidad,
    string Descripcion,
    decimal PrecioUnitario,
    string? Notas);

public sealed record PreticketContenido(
    short VersionEsquema,
    string NombreSucursal,
    string NombreMesa,
    DateTime SolicitadoEnUtc,
    IReadOnlyList<LineaPreticketContenido> Lineas,
    decimal Total,
    string LeyendaNoFiscal);

public sealed record LineaComandaContenido(int Cantidad, string Descripcion, string? Notas);

public sealed record ComandaContenido(
    short VersionEsquema,
    string NombreSucursal,
    string NombreMesa,
    string AreaProduccion,
    DateTime SolicitadoEnUtc,
    IReadOnlyList<LineaComandaContenido> Lineas);
