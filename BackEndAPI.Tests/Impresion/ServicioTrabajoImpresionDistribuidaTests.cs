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
    public async Task ComprobanteConservaDatosComercialesYNotificaLaCola()
    {
        await using var db = CrearDb();
        var fixture = await SeedAsync(db);
        var sucursal = await db.Sucursales.SingleAsync();
        var empresa = new Empresa { Id = sucursal.IdEmpresa, Nombre = "Café Empresa", Username = "empresa",
            Cuit = 30123456789, Emails = ["contacto@cafe.test"], Telefonos = ["1112345678"] };
        empresa.EstablecerContrasena([1], [2]);
        db.Add(empresa);
        sucursal.Direccion = "Av. Siempre Viva 123";
        sucursal.Telefono = "1145678901";
        db.Add(new TipoMovimientoCaja { Id = 7, Nombre = "Tarjeta", Entorno = "Ventas" });
        (await db.ReglasImpresion.SingleAsync()).Momento = MomentoImpresion.AlCobrarProductosSinFacturar;
        await db.SaveChangesAsync();
        var identity = new IdentidadImpresionFalsa { IdSucursal = fixture.BranchId, TipoAutenticacion = "sucursal" };
        var current = new ContextoDbActualFalso(db);
        var options = Options.Create(new OpcionesImpresionDistribuida());
        var notificador = new NotificadorFalso();
        var trabajos = new ServicioTrabajoImpresion(current, identity,
            new ServicioReglaImpresion(current, identity, options, TimeProvider.System),
            notificador, options, TimeProvider.System);
        var documentos = new BackEndAPI.Impresion.Documentos.ServicioDocumentoImpresion(
            current, identity, trabajos, TimeProvider.System,
            Microsoft.Extensions.Logging.Abstractions.NullLogger<BackEndAPI.Impresion.Documentos.ServicioDocumentoImpresion>.Instance);
        var pago = new MovimientoCaja { IdTipoMovimientoCaja = 7, MontoTotal = 95, MontoAbonado = 100, Vuelto = 5,
            FechaMovimiento = new DateTime(2026, 9, 14, 15, 0, 0, DateTimeKind.Utc) };
        await documentos.EncolarComprobantePagoAsync(new Visita { Origen = "Local", Mesa = new Mesa { Numero = 4 } },
            [new ProductosPorVisita { NombreProducto = "Café", PrecioDelMomento = 100 }],
            pago, default, descuento: 10, recargo: 5);
        var trabajo = await db.TrabajosImpresion.SingleAsync();
        using var json = System.Text.Json.JsonDocument.Parse(trabajo.ContenidoJson);
        var contenido = json.RootElement;
        Assert.Equal(1, notificador.Notificaciones);
        Assert.Equal("Café Empresa", contenido.GetProperty("nombreEmpresa").GetString());
        Assert.Equal("30123456789", contenido.GetProperty("cuit").GetString());
        Assert.Equal(sucursal.Direccion, contenido.GetProperty("direccion").GetString());
        Assert.Equal(sucursal.Telefono, contenido.GetProperty("telefono").GetString());
        Assert.Equal("contacto@cafe.test", contenido.GetProperty("email").GetString());
        Assert.Equal("Tarjeta", contenido.GetProperty("medioPago").GetString());
        Assert.Equal(pago.Id.ToString("D"), contenido.GetProperty("referenciaPago").GetString());
        Assert.Equal(pago.FechaMovimiento, contenido.GetProperty("solicitadoEnUtc").GetDateTime());
        Assert.Equal(100, contenido.GetProperty("subtotal").GetDecimal());
        Assert.Equal(10, contenido.GetProperty("descuento").GetDecimal());
        Assert.Equal(5, contenido.GetProperty("recargo").GetDecimal());
        Assert.Equal(0, contenido.GetProperty("ajustePedido").GetDecimal());
        Assert.Equal(95, contenido.GetProperty("total").GetDecimal());
    }

    [Fact]
    public async Task AdmiteLosEventosOperativosYConservaReglasAnterioresParaDeshabilitar()
    {
        await using var db = CrearDb();
        var fixture = await SeedAsync(db);
        var identity = new IdentidadImpresionFalsa { IdSucursal = fixture.BranchId, TipoAutenticacion = "sucursal" };
        var service = new ServicioReglaImpresion(new ContextoDbActualFalso(db), identity,
            Options.Create(new OpcionesImpresionDistribuida()), TimeProvider.System);
        var printerId = await db.Impresoras.Select(x => x.Id).SingleAsync();
        await service.GuardarAsync(new(null, printerId, TipoSalidaImpresion.Comanda, MomentoImpresion.AlCargarProductosMesa), default);
        await service.GuardarAsync(new(null, printerId, TipoSalidaImpresion.Ticket, MomentoImpresion.AlCobrarProductosSinFacturar), default);
        Assert.Single(await service.ResolverAsync(TipoDocumentoImpresion.Comanda, MomentoImpresion.AlCargarProductosMesa, default));
        Assert.Single(await service.ResolverAsync(TipoDocumentoImpresion.Preticket, MomentoImpresion.AlGenerarPreticket, default));
        Assert.Single(await service.ResolverAsync(TipoDocumentoImpresion.ComprobantePago, MomentoImpresion.AlCobrarProductosSinFacturar, default));
        foreach (var tipo in Enum.GetValues<TipoSalidaImpresion>())
        foreach (var momento in Enum.GetValues<MomentoImpresion>())
        {
            if ((tipo == TipoSalidaImpresion.Comanda && momento == MomentoImpresion.AlCargarProductosMesa)
                || (tipo == TipoSalidaImpresion.Ticket && momento is MomentoImpresion.AlGenerarPreticket or MomentoImpresion.AlCobrarProductosSinFacturar)) continue;
            foreach (var habilitada in new[] { true, false })
            {
                var error = await Assert.ThrowsAsync<ExcepcionEstacionImpresion>(() =>
                    service.GuardarAsync(new(null, printerId, tipo, momento, habilitada), default));
                Assert.Equal("REGLA_IMPRESION_NO_COMPATIBLE", error.Codigo);
            }
        }
        var anterior = new ReglaImpresion { IdSucursal = fixture.BranchId, IdImpresora = printerId,
            TipoSalida = TipoSalidaImpresion.Ticket, Momento = MomentoImpresion.AlCobrarProductosFacturados };
        db.Add(anterior); await db.SaveChangesAsync();
        Assert.False((await service.ObtenerTodasAsync(default)).Single(x => x.Id == anterior.Id).Compatible);
        Assert.Contains((await service.ValidarAsync(default)).Problemas, x => x.Codigo == "REGLA_IMPRESION_NO_COMPATIBLE");
        Assert.Empty(await service.ResolverAsync(TipoDocumentoImpresion.Preticket, anterior.Momento, default));
        await service.GuardarAsync(new(anterior.Id, printerId, anterior.TipoSalida, anterior.Momento, false), default);
        await Assert.ThrowsAsync<ExcepcionEstacionImpresion>(() => service.GuardarAsync(new(anterior.Id, printerId, anterior.TipoSalida, anterior.Momento, true), default));
        Assert.Equal(4, await db.ReglasImpresion.CountAsync());
        await service.EliminarAsync(anterior.Id, default);
        Assert.Equal(3, await db.ReglasImpresion.CountAsync());
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

    [Theory]
    [InlineData("{}", false)]
    [InlineData("{\"lineas\":[{\"cantidad\":1,\"descripcion\":\"Café\"}]}", true)]
    public async Task ReimpresionRequiereContenidoRetenido(string contenido, bool retenido)
    {
        await using var db = CrearDb();
        var fixture = await SeedAsync(db);
        var creador = CrearServicio(db, fixture.BranchId, null, "sucursal");
        var respuesta = await creador.CrearEnrutadosAsync(new(Guid.NewGuid(), TipoDocumentoImpresion.Preticket,
            MomentoImpresion.AlGenerarPreticket, contenido, 1, 1, "retencion", "Visita", "1", null), default);
        var original = await db.TrabajosImpresion.SingleAsync();
        original.Estado = EstadoTrabajoImpresion.RequiereAtencion;
        await db.SaveChangesAsync();
        var notificador = new NotificadorFalso();
        var identity = new IdentidadImpresionFalsa { IdSucursal = fixture.BranchId, TipoAutenticacion = "sucursal" };
        var options = Options.Create(new OpcionesImpresionDistribuida());
        var current = new ContextoDbActualFalso(db);
        var servicio = new ServicioTrabajoImpresion(current, identity,
            new ServicioReglaImpresion(current, identity, options, TimeProvider.System), notificador, options, TimeProvider.System);
        if (retenido)
        {
            var copia = await servicio.ReintentarAsync(original.Id, "verificar", default);
            Assert.Equal(contenido, (await db.TrabajosImpresion.SingleAsync(x => x.Id == copia.Id)).ContenidoJson);
            Assert.Equal(1, notificador.Notificaciones);
            Assert.Equal(2, await db.TrabajosImpresion.CountAsync());
        }
        else
        {
            var error = await Assert.ThrowsAsync<ExcepcionEstacionImpresion>(() => servicio.ReintentarAsync(original.Id, "verificar", default));
            Assert.Equal(409, error.CodigoEstado);
            Assert.Equal("DOCUMENTO_IMPRESION_ELIMINADO", error.Codigo);
            Assert.Equal(0, notificador.Notificaciones);
            Assert.Single(await db.TrabajosImpresion.ToListAsync());
            Assert.DoesNotContain(db.ChangeTracker.Entries(), x => x.State == EntityState.Added);
        }
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
        public int Notificaciones { get; private set; }
        public Task TrabajosDisponiblesAsync(IEnumerable<Guid> idsEstacion, CancellationToken tokenCancelacion)
        { Notificaciones++; return Task.CompletedTask; }
    }
}
