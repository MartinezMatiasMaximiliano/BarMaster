using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services;
namespace BackEndAPI.Tests.Contratos;
public class EntregaContratoTests
{
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task EntregaYReversionPersistenSinAlterarPago(bool pagado)
    {
        var movimiento = Guid.NewGuid();
        var pedido = new DeliveryAndTakeaway { Visita = new Visita { Estado = pagado ? "Cerrada" : "Abierta", Productos = [new ProductosPorVisita { EstadoPagado = pagado, IdMovimientoCaja = movimiento }] } };
        var escrituras = 0;
        var repo = DobleContrato.Crear<IDeliveryTakeawayRepository>((m,a) => { if (m.Name == "ModificarDeliveryTakeaway") escrituras++; return Task.FromResult<DeliveryAndTakeaway?>(pedido); });
        var servicio = new DeliveryTakeawayServices(repo, null!, null!, null!, null!, null!);
        await servicio.MarcarComoEntregado(pedido.Id);
        Assert.True((await servicio.ObtenerDeliveryTakeawayPorId(pedido.Id))!.Entregado);
        await servicio.MarcarComoEntregado(pedido.Id, false);
        Assert.False((await servicio.ObtenerDeliveryTakeawayPorId(pedido.Id))!.Entregado);
        Assert.Equal(2, escrituras);
        Assert.Equal(pagado ? "Cerrada" : "Abierta", pedido.Visita.Estado);
        Assert.Equal(pagado, pedido.Visita.Productos.Single().EstadoPagado);
        Assert.Equal(movimiento, pedido.Visita.Productos.Single().IdMovimientoCaja);
    }
}
