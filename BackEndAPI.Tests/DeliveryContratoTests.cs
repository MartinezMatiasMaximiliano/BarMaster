using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services;
using BackEndAPI.Services.Interfaces;
namespace BackEndAPI.Tests.Contratos;
public class DeliveryContratoTests
{
    [Theory]
    [InlineData("Delivery")]
    [InlineData("Takeaway")]
    public async Task EsperaProductosAntesDePersistirYDescuentaStock(string origen)
    {
        var producto = new Producto { Id = Guid.NewGuid(), Nombre = "Café", PrecioNeto = 100 };
        var pendiente = new TaskCompletionSource<Producto?>();
        DeliveryAndTakeaway? guardado = null;
        IReadOnlyDictionary<Guid, int>? stock = null;
        var repo = DobleContrato.Crear<IDeliveryTakeawayRepository>((m, a) => m.Name switch {
            "GetPrecioEnvioPorId" => Task.FromResult(25m),
            "CrearDeliveryTakeaway" => Guardar((DeliveryAndTakeaway)a[0]!),
            _ => throw new Exception(m.Name)
        });
        Task<DeliveryAndTakeaway?> Guardar(DeliveryAndTakeaway pedido) {
            Assert.Equal(3, pedido.Visita.Productos.Count);
            guardado = pedido;
            return Task.FromResult<DeliveryAndTakeaway?>(pedido);
        }
        var servicio = new DeliveryTakeawayServices(repo,
            DobleContrato.Crear<ICajasServices>((m,a) => Task.FromResult<Caja?>(new Caja { Id = Guid.NewGuid() })),
            DobleContrato.Crear<IProductosRepository>((m,a) => pendiente.Task),
            DobleContrato.Crear<IPersonasRepository>((m,a) => Task.FromResult<Persona?>(new Persona())),
            DobleContrato.Crear<IStockServices>((m,a) => { stock = (IReadOnlyDictionary<Guid,int>)a[1]!; return Task.CompletedTask; }),
            new TransaccionPrueba());
        var tarea = servicio.CrearDeliveryTakeaway(Guid.NewGuid(), new CrearDeliveryTakeawayDTO {
            Origen = origen, IdCadete = Guid.NewGuid(), IdTipoEnvio = 1,
            ListaProductos = [new AgregarProductoAVisita { IdProducto = producto.Id, Cantidad = 3, Detalles = "Sin azúcar" }]
        });
        Assert.Null(guardado);
        pendiente.SetResult(producto);
        var resultado = await tarea;
        Assert.Same(guardado, resultado);
        Assert.All(resultado!.Visita.Productos, p => Assert.Equal("Sin azúcar", p.Detalles));
        Assert.Equal(3, stock![producto.Id]);
        Assert.Equal(origen == "Delivery" ? 325m : 300m, resultado.PrecioTotal);
    }
}
