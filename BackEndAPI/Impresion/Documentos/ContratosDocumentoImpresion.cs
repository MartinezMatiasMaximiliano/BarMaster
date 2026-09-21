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

public sealed record ComprobantePagoContenido(
    short VersionEsquema,
    string NombreSucursal,
    string NombreMesa,
    DateTime SolicitadoEnUtc,
    IReadOnlyList<LineaPreticketContenido> Lineas,
    decimal Total,
    decimal MontoAbonado,
    decimal Vuelto,
    string LeyendaNoFiscal)
{
    public string? NombreEmpresa { get; init; }
    public string? Cuit { get; init; }
    public string? Direccion { get; init; }
    public string? Telefono { get; init; }
    public string? Email { get; init; }
    public string? MedioPago { get; init; }
    public string? ReferenciaPago { get; init; }
    public string? Origen { get; init; }
    public decimal Subtotal { get; init; }
    public decimal AjustePedido { get; init; }
    public decimal Descuento { get; init; }
    public decimal Recargo { get; init; }
}

public sealed record LineaComandaContenido(int Cantidad, string Descripcion, string? Notas);

public sealed record ComandaContenido(
    short VersionEsquema,
    string NombreSucursal,
    string NombreMesa,
    string AreaProduccion,
    DateTime SolicitadoEnUtc,
    IReadOnlyList<LineaComandaContenido> Lineas);
