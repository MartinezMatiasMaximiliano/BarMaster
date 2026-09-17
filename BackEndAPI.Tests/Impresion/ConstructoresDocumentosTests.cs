using BackEndAPI.Impresion.Documentos;
using BackEndAPI.Models;

namespace BackEndAPI.Tests.Impresion;

public sealed class ConstructoresDocumentosTests
{
    private static readonly DateTime Instante = new(2030, 1, 2, 3, 4, 0, DateTimeKind.Utc);
    private static ProductosPorVisita Linea(string nombre, decimal precio, string? notas = null) =>
        new() { NombreProducto = nombre, PrecioDelMomento = precio, Detalles = notas };

    [Fact]
    public void PreticketAgrupaCantidadNotasYTotal()
    {
        var documento = ConstructorPreticket.Crear("Centro", "4", Instante,
            [Linea("Café", 100, " sin azúcar "), Linea("Café", 100, "sin azúcar")]);
        var linea = Assert.Single(documento.Lineas);
        Assert.Equal(2, linea.Cantidad);
        Assert.Equal("sin azúcar", linea.Notas);
        Assert.Equal(200, documento.Total);
    }

    [Fact]
    public void ComandaMantieneEstructuraCompatible()
    {
        var documento = ConstructorComanda.Crear("Centro", "Patio", Instante,
            [Linea("Pizza", 1), Linea("Pizza", 2)]);
        Assert.Equal(1, documento.VersionEsquema);
        Assert.Equal(2, Assert.Single(documento.Lineas).Cantidad);
        Assert.Equal("Comanda", documento.AreaProduccion);
    }

    [Fact]
    public void ComprobanteCalculaSubtotalYAjustes()
    {
        var pago = new MovimientoCaja { Id = Guid.NewGuid(), FechaMovimiento = Instante, MontoTotal = 190,
            MontoAbonado = 200, Vuelto = 10 };
        var documento = ConstructorComprobante.Crear("Centro", "4", "Local", pago,
            [Linea("Café", 100), Linea("Café", 100)], new("Bar", "1", null, null, null, "Efectivo", 10, 0));
        Assert.Equal(200, documento.Subtotal);
        Assert.Equal(0, documento.AjustePedido);
        Assert.Equal(pago.Id.ToString("D"), documento.ReferenciaPago);
    }
}
