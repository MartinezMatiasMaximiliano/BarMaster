using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Models.Impresion;
using BackEndAPI.Impresion;
using BackEndAPI.Impresion.Dispositivos;
using BackEndAPI.Impresion.Trabajos;
using BackEndAPI.Impresion.Notificaciones;
using BackEndAPI.Impresion.Reglas;
using BackEndAPI.Impresion.Estaciones;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Options;

namespace BackEndAPI.Tests.Impresion;

public sealed class ServicioTrabajoImpresionDistribuidaTests
{
    [Fact]
    public async Task MismaImpresoraPuedeTenerReglasParaDiferentesMomentos()
    {
        await using var db = CrearDb();
        var fixture = await SeedAsync(db);
        var identity = new IdentidadImpresionFalsa { IdSucursal = fixture.BranchId, TipoAutenticacion = "sucursal" };
        var options = Options.Create(new OpcionesImpresionDistribuida());
        var service = new ServicioReglaImpresion(new ContextoDbActualFalso(db), identity, options, TimeProvider.System);
        var printerId = await db.Impresoras.Select(x => x.Id).SingleAsync();

        await service.GuardarAsync(new(null, printerId, TipoSalidaImpresion.Ticket, MomentoImpresion.AlCobrarProductosFacturados), default);

        var routes = await service.ObtenerTodasAsync(default);
        Assert.Equal(2, routes.Count);
        Assert.All(routes, route => Assert.Equal(printerId, route.IdImpresora));
        Assert.Contains(routes, route => route.Momento == MomentoImpresion.AlGenerarPreticket);
        Assert.Contains(routes, route => route.Momento == MomentoImpresion.AlCobrarProductosFacturados);
    }

    [Fact]
    public async Task PreticketRequiereReglaAlGenerarPreticket()
    {
        await using var db = CrearDb();
        var fixture = await SeedAsync(db);
        var regla = await db.ReglasImpresion.SingleAsync();
        regla.Momento = MomentoImpresion.AlCobrarProductosFacturados;
        await db.SaveChangesAsync();

        var error = await Assert.ThrowsAsync<ExcepcionEstacionImpresion>(() =>
            CrearServicio(db, fixture.BranchId, null, "sucursal").CrearEnrutadosAsync(new(
            Guid.NewGuid(), TipoDocumentoImpresion.Preticket, MomentoImpresion.AlGenerarPreticket,
            "{\"schemaVersion\":1}", 1, 1, "manual-preticket-without-route", "Visita", "1", null), default));

        Assert.Equal("REGLA_IMPRESION_NO_CONFIGURADA", error.Codigo);
    }

    [Fact]
    public async Task MismaClaveIdempotenciaCreaUnSoloTrabajo()
    {
        await using var db = CrearDb();
        var fixture = await SeedAsync(db);
        var service = CrearServicio(db, fixture.BranchId, null, "sucursal");
        var command = new CrearTrabajosImpresionEnrutadosComando(Guid.NewGuid(), TipoDocumentoImpresion.Preticket, MomentoImpresion.AlGenerarPreticket,
            "{\"schemaVersion\":1}", 1, 1, "same-command", "Visita", Guid.NewGuid().ToString(), null);

        var first = await service.CrearEnrutadosAsync(command, default);
        var second = await service.CrearEnrutadosAsync(command, default);

        Assert.Single(first.Trabajos);
        Assert.Equal(first.Trabajos[0].Id, second.Trabajos[0].Id);
        Assert.Equal(1, await db.TrabajosImpresion.CountAsync());
        Assert.Equal("Principal", (await db.TrabajosImpresion.SingleAsync()).NombreVisibleImpresora);
    }

    [Fact]
    public async Task EstacionSoloPuedeReservarYCompletarSuPropioTrabajo()
    {
        await using var db = CrearDb();
        var fixture = await SeedAsync(db);
        var creator = CrearServicio(db, fixture.BranchId, null, "sucursal");
        await creator.CrearEnrutadosAsync(new(Guid.NewGuid(), TipoDocumentoImpresion.Preticket, MomentoImpresion.AlGenerarPreticket,
            "{\"schemaVersion\":1}", 1, 1, "claim", "Visita", "1", null), default);
        var other = CrearServicio(db, fixture.BranchId, Guid.NewGuid(), "estacion_impresion");
        await Assert.ThrowsAsync<ExcepcionEstacionImpresion>(() => other.ReservarAsync(1, default));

        var worker = CrearServicio(db, fixture.BranchId, fixture.IdEstacion, "estacion_impresion");
        var claimed = Assert.Single(await worker.ReservarAsync(1, default));
        await worker.MarcarEnviandoAsync(claimed.Id, claimed.IdReserva, default);
        await worker.MarcarAceptadoPorColaAsync(claimed.Id, claimed.IdReserva, default);

        Assert.Equal(EstadoTrabajoImpresion.AceptadoPorCola, (await db.TrabajosImpresion.SingleAsync()).Estado);
        Assert.Equal(1, (await db.TrabajosImpresion.SingleAsync()).CantidadIntentos);
    }

    [Fact]
    public async Task FallaLuegoDelEnvioRequiereAtencionManual()
    {
        await using var db = CrearDb();
        var fixture = await SeedAsync(db);
        await CrearServicio(db, fixture.BranchId, null, "sucursal").CrearEnrutadosAsync(new(
            Guid.NewGuid(), TipoDocumentoImpresion.Preticket, MomentoImpresion.AlGenerarPreticket, "{}", 1, 1, "ambiguous", "Visita", "1", null), default);
        var worker = CrearServicio(db, fixture.BranchId, fixture.IdEstacion, "estacion_impresion");
        var claimed = Assert.Single(await worker.ReservarAsync(1, default));
        await worker.MarcarEnviandoAsync(claimed.Id, claimed.IdReserva, default);
        await worker.MarcarFallidoAsync(claimed.Id, new(claimed.IdReserva, "CONNECTION_LOST", "lost", true, true, null), default);
        Assert.Equal(EstadoTrabajoImpresion.RequiereAtencion, (await db.TrabajosImpresion.SingleAsync()).Estado);
    }

    [Fact]
    public async Task EstacionNoPuedeLeerInventarioDeOtraEstacion()
    {
        await using var db = CrearDb();
        var fixture = await SeedAsync(db);
        var service = new ServicioImpresora(new ContextoDbActualFalso(db),
            new IdentidadImpresionFalsa { IdSucursal = fixture.BranchId, IdEstacion = Guid.NewGuid(), TipoAutenticacion = "estacion_impresion" },
            Options.Create(new OpcionesImpresionDistribuida()), TimeProvider.System);
        await Assert.ThrowsAsync<ExcepcionEstacionImpresion>(() => service.ObtenerParaEstacionAsync(fixture.IdEstacion, default));
    }

    [Fact]
    public async Task EstacionRevocadaNoPuedeReservarConIdentidadDeTokenExistente()
    {
        await using var db = CrearDb();
        var fixture = await SeedAsync(db);
        var station = await db.EstacionesImpresion.SingleAsync(x => x.Id == fixture.IdEstacion);
        station.Habilitada = false; station.RevocadaEn = DateTime.UtcNow; await db.SaveChangesAsync();
        var worker = CrearServicio(db, fixture.BranchId, fixture.IdEstacion, "estacion_impresion");
        await Assert.ThrowsAsync<ExcepcionEstacionImpresion>(() => worker.ReservarAsync(1, default));
    }

    private static ServicioTrabajoImpresion CrearServicio(AppDbContext db, Guid branchId, Guid? stationId, string authType)
    {
        var identity = new IdentidadImpresionFalsa { IdSucursal = branchId, IdEstacion = stationId, TipoAutenticacion = authType };
        var options = Options.Create(new OpcionesImpresionDistribuida());
        var current = new ContextoDbActualFalso(db);
        var route = new ServicioReglaImpresion(current, identity, options, TimeProvider.System);
        return new(current, identity, route, new NotificadorFalso(), options, TimeProvider.System);
    }

    private static async Task<(Guid BranchId, Guid IdEstacion)> SeedAsync(AppDbContext db)
    {
        var branch = new Sucursal { Id = Guid.NewGuid(), IdEmpresa = Guid.NewGuid(), Nombre = "Sucursal", Username = Guid.NewGuid().ToString("N") };
        branch.EstablecerContrasena([1], [2]);
        var station = new EstacionImpresion { IdSucursal = branch.Id, IdInstalacionCliente = Guid.NewGuid(), Nombre = "Caja", VistaPorUltimaVezEn = DateTime.UtcNow };
        var printer = new Impresora { Estacion = station, NombreSistema = "Printer", NombreSistemaNormalizado = "PRINTER", NombreVisible = "Principal", Presente = true, VistaPorUltimaVezEn = DateTime.UtcNow, ActualizadoEn = DateTime.UtcNow };
        var route = new ReglaImpresion { IdSucursal = branch.Id, Impresora = printer, TipoSalida = TipoSalidaImpresion.Ticket, Momento = MomentoImpresion.AlGenerarPreticket, CreadoEn = DateTime.UtcNow, ActualizadoEn = DateTime.UtcNow };
        db.AddRange(branch, station, printer, route); await db.SaveChangesAsync();
        return (branch.Id, station.Id);
    }

    private static AppDbContext CrearDb() => new(new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning)).Options);

    private sealed class NotificadorFalso : INotificadorImpresion
    {
        public Task TrabajosDisponiblesAsync(IEnumerable<Guid> idsEstacion, CancellationToken tokenCancelacion) => Task.CompletedTask;
    }
}
