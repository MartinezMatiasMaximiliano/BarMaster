using BackEndAPI.Data;
using BackEndAPI.Impresion.Trabajos;
using BackEndAPI.Models;
using BackEndAPI.Repositories;
using BackEndAPI.Services.Pedidos;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace BackEndAPI.Tests;

public sealed class PedidosComponentesTests
{
    private sealed class Contexto(AppDbContext db) : ICurrentDbContext { public AppDbContext Db => db; }

    [Fact]
    public async Task ConsultaProductosResuelveTodoElPedidoEnLote()
    {
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var uno = new Producto { Nombre = "Uno" };
        var dos = new Producto { Nombre = "Dos" };
        db.Productos.AddRange(uno, dos);
        await db.SaveChangesAsync();
        var consulta = new ConsultaProductosLote(new ProductosRepository(new Contexto(db)));

        var resultado = await consulta.ObtenerAsync([uno.Id, dos.Id, Guid.NewGuid(), uno.Id]);

        Assert.Equal(2, resultado.Count);
        Assert.Equal("Uno", resultado[uno.Id].Nombre);
    }

    [Fact]
    public async Task FalloDeNotificacionPosteriorNoFallaElPedidoConfirmado()
    {
        var publicador = new PublicadorNotificacionesPedido(new TrabajoQueFalla(),
            NullLogger<PublicadorNotificacionesPedido>.Instance);
        var solicitud = new CrearSolicitudImpresionRespuesta(Guid.NewGuid(), []);

        await publicador.PublicarAsync([solicitud], Guid.NewGuid());
    }

    private sealed class TrabajoQueFalla : IServicioTrabajoImpresion
    {
        public Task NotificarAsync(CrearSolicitudImpresionRespuesta respuesta, CancellationToken token) => throw new InvalidOperationException("sin red");
        public Task<CrearSolicitudImpresionRespuesta> CrearEnrutadosAsync(CrearTrabajosImpresionEnrutadosComando c, CancellationToken t) => throw new NotImplementedException();
        public Task<ResumenTrabajoImpresionRespuesta> CrearPruebaImpresoraAsync(Guid id, CancellationToken t) => throw new NotImplementedException();
        public Task<IReadOnlyList<TrabajoImpresionReservadoRespuesta>> ReservarAsync(int max, CancellationToken t) => throw new NotImplementedException();
        public Task MarcarEnviandoAsync(Guid id, Guid reserva, CancellationToken t) => throw new NotImplementedException();
        public Task RenovarReservaAsync(Guid id, Guid reserva, CancellationToken t) => throw new NotImplementedException();
        public Task MarcarAceptadoPorColaAsync(Guid id, Guid reserva, CancellationToken t) => throw new NotImplementedException();
        public Task MarcarFallidoAsync(Guid id, FallarTrabajoImpresionSolicitud s, CancellationToken t) => throw new NotImplementedException();
        public Task<IReadOnlyList<ResumenTrabajoImpresionRespuesta>> ObtenerPorSolicitudAsync(Guid id, CancellationToken t) => throw new NotImplementedException();
        public Task<IReadOnlyList<ResumenTrabajoImpresionRespuesta>> ConsultarAsync(ConsultaTrabajosImpresion c, CancellationToken t) => throw new NotImplementedException();
        public Task<ResumenTrabajoImpresionRespuesta> ReintentarAsync(Guid id, string motivo, CancellationToken t) => throw new NotImplementedException();
        public Task CancelarAsync(Guid id, string motivo, CancellationToken t) => throw new NotImplementedException();
        public Task<PanelImpresionRespuesta> ObtenerPanelAsync(CancellationToken t) => throw new NotImplementedException();
    }
}
