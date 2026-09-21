using BackEndAPI.Models;

namespace BackEndAPI.Impresion.Documentos;

public static class AgrupadorLineasImpresion
{
    public static IReadOnlyList<LineaPreticketContenido> ConPrecio(IEnumerable<ProductosPorVisita> productos) => productos
        .GroupBy(x => new { x.NombreProducto, x.PrecioDelMomento, Notas = NormalizarNotas(x.Detalles) })
        .Select(g => new LineaPreticketContenido(g.Count(), g.Key.NombreProducto, g.Key.PrecioDelMomento, g.Key.Notas))
        .OrderBy(x => x.Descripcion).ToList();

    public static IReadOnlyList<LineaComandaContenido> SinPrecio(IEnumerable<ProductosPorVisita> productos) => productos
        .GroupBy(x => new { x.NombreProducto, Notas = NormalizarNotas(x.Detalles) })
        .Select(g => new LineaComandaContenido(g.Count(), g.Key.NombreProducto, g.Key.Notas))
        .OrderBy(x => x.Descripcion).ToList();

    private static string? NormalizarNotas(string? notas) => string.IsNullOrWhiteSpace(notas) ? null : notas.Trim();
}

public static class ConstructorPreticket
{
    public static PreticketContenido Crear(string sucursal, string mesa, DateTime instante, IEnumerable<ProductosPorVisita> productos)
    {
        var lineas = AgrupadorLineasImpresion.ConPrecio(productos);
        return new(1, sucursal, mesa, instante, lineas, lineas.Sum(x => x.Cantidad * x.PrecioUnitario),
            "DOCUMENTO NO VALIDO COMO FACTURA");
    }
}

public static class ConstructorComanda
{
    public static ComandaContenido Crear(string sucursal, string mesa, DateTime instante, IEnumerable<ProductosPorVisita> productos) =>
        new(1, sucursal, mesa, "Comanda", instante, AgrupadorLineasImpresion.SinPrecio(productos));
}

public sealed record DatosComprobante(string? Empresa, string? Cuit, string? Direccion, string? Telefono,
    string? Email, string? MedioPago, decimal Descuento, decimal Recargo);

public static class ConstructorComprobante
{
    public static ComprobantePagoContenido Crear(string sucursal, string mesa, string origen, MovimientoCaja pago,
        IEnumerable<ProductosPorVisita> productos, DatosComprobante datos)
    {
        var lineas = AgrupadorLineasImpresion.ConPrecio(productos);
        var subtotal = lineas.Sum(x => x.Cantidad * x.PrecioUnitario);
        return new(1, sucursal, mesa, DateTime.SpecifyKind(pago.FechaMovimiento, DateTimeKind.Utc), lineas,
            pago.MontoTotal, pago.MontoAbonado, pago.Vuelto, "DOCUMENTO NO VALIDO COMO FACTURA")
        {
            NombreEmpresa = datos.Empresa, Cuit = datos.Cuit, Direccion = datos.Direccion, Telefono = datos.Telefono,
            Email = datos.Email, MedioPago = datos.MedioPago, ReferenciaPago = pago.Id.ToString("D"), Origen = origen,
            Subtotal = subtotal, AjustePedido = pago.MontoTotal + datos.Descuento - datos.Recargo - subtotal,
            Descuento = datos.Descuento, Recargo = datos.Recargo
        };
    }
}
