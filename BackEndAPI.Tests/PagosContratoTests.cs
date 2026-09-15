using BackEndAPI.ARCA.Clases;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services;
namespace BackEndAPI.Tests.Contratos;
public class PagosContratoTests
{
    private static (PagosServices, Visita) Preparar(string origen = "Local", string estado = "Abierta")
    {
        var visita = new Visita { Origen = origen, Estado = estado, Total = 200,
            Productos = [new ProductosPorVisita { Id = 1, PrecioDelMomento = 100 }, new ProductosPorVisita { Id = 2, PrecioDelMomento = 100 }] };
        var repo = DobleContrato.Crear<IPagosRepository>((m,a) => {
            var movimiento = (MovimientoCaja)a[1]!;
            Assert.Equal(movimiento.MontoTotal, (decimal)a[3]!);
            return Task.FromResult<(MovimientoCaja, FacturaElectronica)>((movimiento, null!));
        });
        return (new PagosServices(DobleContrato.Crear<IVisitasRepository>((m,a) => Task.FromResult(visita)), repo,
            DobleContrato.Crear<IDeliveryTakeawayRepository>((m,a) => Task.FromResult<DeliveryAndTakeaway?>(new DeliveryAndTakeaway { Visita = visita, PrecioTotal = 200 }))), visita);
    }
    [Theory]
    [InlineData("Delivery")]
    [InlineData("Takeaway")]
    public async Task PedidoEntregadoPendientePuedeCobrarse(string origen)
    {
        var (servicio, visita) = Preparar(origen, "Cerrada");
        await servicio.PagarProductos(new CrearPagoDTO { IdVisita = visita.Id, MontoAbonado = 200, ListaIdsProductos = [1,2] });
        Assert.All(visita.Productos, p => Assert.True(p.EstadoPagado));
    }

    [Theory]
    [InlineData(1, 80, 0)]
    [InlineData(1, 100, 20)]
    [InlineData(2, 80, 0)]
    public async Task DescuentoParcialUsaMismoNetoEnCajaYVuelto(int medio, decimal abonado, decimal vuelto)
    {
        var (servicio, visita) = Preparar();
        var (pago, _) = await servicio.PagarProductos(new CrearPagoDTO { IdVisita = visita.Id, IdTipoMovimiento = medio, ListaIdsProductos = [1], MontoAbonado = abonado, descuentoDecimal = 20 });
        Assert.Equal(80, pago.MontoTotal);
        Assert.Equal(vuelto, pago.Vuelto);
        Assert.Equal(180, visita.Total);
        Assert.True(visita.Productos.First().EstadoPagado);
        Assert.False(visita.Productos.Last().EstadoPagado);
    }
    [Fact]
    public async Task InsuficienteNoModificaProductosNiTotal()
    {
        var (servicio, visita) = Preparar();
        await Assert.ThrowsAsync<Exception>(() => servicio.PagarProductos(new CrearPagoDTO { IdVisita = visita.Id, ListaIdsProductos = [1], MontoAbonado = 79, descuentoDecimal = 20 }));
        Assert.All(visita.Productos, p => { Assert.False(p.EstadoPagado); Assert.Null(p.IdMovimientoCaja); });
        Assert.Equal(200, visita.Total);
    }
    [Fact]
    public async Task DescuentoTotalEnPedido()
    {
        var (servicio, visita) = Preparar("Delivery");
        var (pago, _) = await servicio.PagarProductos(new CrearPagoDTO { IdVisita = visita.Id, ListaIdsProductos = [1,2], MontoAbonado = 150, descuentoDecimal = 50 });
        Assert.Equal(150, pago.MontoTotal);
        Assert.Equal(0, pago.Vuelto);
        Assert.Equal(150, visita.Total);
    }
}
