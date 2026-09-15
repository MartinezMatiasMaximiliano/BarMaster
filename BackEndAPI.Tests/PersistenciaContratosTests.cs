using BackEndAPI.Data;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
namespace BackEndAPI.Tests.Contratos;
public class PersistenciaContratosTests
{
    [Theory]
    [InlineData("Delivery")]
    [InlineData("Takeaway")]
    public async Task ProductosYEntregaSeConservanAlRecargar(string origen)
    {
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var contexto = DobleContrato.Crear<ICurrentDbContext>((m,a) => db);
        var transaccion = new TransaccionPrueba();
        var producto = new Producto { Nombre = "Café", PrecioNeto = 100 };
        var sucursal = Guid.NewGuid();
        db.AddRange(producto, new TipoEnvio { Id = 1, Nombre = "Moto", Precio = 25 });
        await db.SaveChangesAsync();
        var productos = new ProductosRepository(contexto);
        var repo = new DeliveryTakeawayRepository(contexto, transaccion);
        var servicio = new DeliveryTakeawayServices(repo,
            DobleContrato.Crear<ICajasServices>((m,a) => Task.FromResult<Caja?>(new Caja())), productos,
            DobleContrato.Crear<IPersonasRepository>((m,a) => Task.FromResult<Persona?>(null)),
            DobleContrato.Crear<IStockServices>((m,a) => Task.CompletedTask), transaccion);
        var pedido = await servicio.CrearDeliveryTakeaway(sucursal, new CrearDeliveryTakeawayDTO { NombreCliente = "Ana", Direccion = "Calle", Origen = origen, IdCadete = Guid.NewGuid(), IdTipoEnvio = 1, ListaProductos = [new AgregarProductoAVisita { IdProducto = producto.Id, Cantidad = 3, Detalles = "Sin azúcar" }] });
        var id = pedido!.Id;
        db.ChangeTracker.Clear();
        var recargado = await repo.ObtenerDeliveryTakeawayPorId(id);
        Assert.Equal(3, recargado!.Visita.Productos.Count);
        Assert.Equal(origen == "Delivery" ? 325 : 300, recargado.PrecioTotal);
        foreach (var entregado in new[] { true, false })
        {
            await servicio.MarcarComoEntregado(id, entregado);
            db.ChangeTracker.Clear();
            recargado = await repo.ObtenerDeliveryTakeawayPorId(id);
            Assert.Equal(entregado, recargado!.Entregado);
            Assert.Equal("Abierta", recargado.Visita.Estado);
            Assert.All(recargado.Visita.Productos, p => Assert.False(p.EstadoPagado));
            Assert.Empty(recargado.Visita.Pagos);
        }
    }
}

