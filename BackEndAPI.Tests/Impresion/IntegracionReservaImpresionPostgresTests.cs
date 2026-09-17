using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Models.Impresion;
using BackEndAPI.Impresion;
using BackEndAPI.Impresion.Trabajos;
using BackEndAPI.Impresion.Notificaciones;
using BackEndAPI.Impresion.Reglas;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Npgsql;
using Microsoft.EntityFrameworkCore.Diagnostics;
using BackEndAPI.Impresion.Estaciones;

namespace BackEndAPI.Tests.Impresion;

public sealed class IntegracionReservaImpresionPostgresTests
{
    [Fact]
    public async Task ColisionIdempotenteConservaCambiosAjenosYDevuelveLosMismosTrabajos()
    {
        await ConBaseAisladaAsync(async options =>
        {
            Guid branchId;
            await using (var setup = new AppDbContext(options))
                branchId = (await SeedAsync(setup)).BranchId;

            var pausa = new PausarPrimerGuardado();
            await using var primerDb = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>(options)
                .AddInterceptors(pausa).Options);
            await using var segundoDb = new AppDbContext(options);
            var sucursal = await primerDb.Sucursales.SingleAsync(x => x.Id == branchId);
            sucursal.Telefono = "telefono-pendiente";
            var comando = new CrearTrabajosImpresionEnrutadosComando(Guid.NewGuid(), TipoDocumentoImpresion.Preticket,
                MomentoImpresion.AlGenerarPreticket, "{}", 1, 1, "carrera-idempotente", "Visita", "1", null);

            var primerSolicitante = CrearServicio(primerDb, branchId, null, "sucursal")
                .CrearEnrutadosAsync(comando, default);
            await pausa.Guardando.Task.WaitAsync(TimeSpan.FromSeconds(10));
            var segundoResultado = await CrearServicio(segundoDb, branchId, null, "sucursal")
                .CrearEnrutadosAsync(comando, default);
            pausa.Continuar.TrySetResult();
            var primerResultado = await primerSolicitante;

            Assert.Equal(segundoResultado.Trabajos.Select(x => x.Id), primerResultado.Trabajos.Select(x => x.Id));
            Assert.Equal(EntityState.Modified, primerDb.Entry(sucursal).State);
            Assert.DoesNotContain(primerDb.ChangeTracker.Entries<TrabajoImpresion>(), x => x.State == EntityState.Added);
            await primerDb.SaveChangesAsync();
            await using var verificacion = new AppDbContext(options);
            Assert.Equal("telefono-pendiente", (await verificacion.Sucursales.SingleAsync(x => x.Id == branchId)).Telefono);
            Assert.Single(await verificacion.TrabajosImpresion.ToListAsync());
        });
    }

    [Fact]
    public async Task SkipLockedPermiteQueSoloUnConsumidorReserveUnTrabajo()
    {
        await ConBaseAisladaAsync(async options =>
        {
            Guid branchId; Guid stationId;
            await using (var setup = new AppDbContext(options))
            {
                var data = await SeedAsync(setup); branchId = data.BranchId; stationId = data.IdEstacion;
                await CrearServicio(setup, branchId, null, "sucursal").CrearEnrutadosAsync(new(
                    Guid.NewGuid(), TipoDocumentoImpresion.Preticket, MomentoImpresion.AlGenerarPreticket, "{}", 1, 1, "pg-concurrency", "Visita", "1", null), default);
            }
            await using var firstDb = new AppDbContext(options);
            await using var secondDb = new AppDbContext(options);
            var claims = await Task.WhenAll(
                CrearServicio(firstDb, branchId, stationId, "estacion_impresion").ReservarAsync(1, default),
                CrearServicio(secondDb, branchId, stationId, "estacion_impresion").ReservarAsync(1, default));
            Assert.Equal(1, claims.Sum(x => x.Count));
        });
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task CancelarYEnviarConcurrentesConservanAlGanador(bool ganaCancelar)
    {
        await ConBaseAisladaAsync(async options =>
        {
            await using var setup = new AppDbContext(options);
            var data = await SeedAsync(setup);
            await CrearServicio(setup, data.BranchId, null, "sucursal").CrearEnrutadosAsync(new(
                Guid.NewGuid(), TipoDocumentoImpresion.Preticket, MomentoImpresion.AlGenerarPreticket, "{}", 1, 1, "race", "Visita", "1", null), default);
            var reservado = Assert.Single(await CrearServicio(setup, data.BranchId, data.IdEstacion, "estacion_impresion").ReservarAsync(1, default));
            var pausa = new PausarGuardado();
            await using var perdedorDb = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>(options).AddInterceptors(pausa).Options);
            await using var ganadorDb = new AppDbContext(options);
            var perdedor = CrearServicio(perdedorDb, data.BranchId, data.IdEstacion, "estacion_impresion");
            var ganador = CrearServicio(ganadorDb, data.BranchId, data.IdEstacion, "estacion_impresion");
            var pendiente = ganaCancelar ? perdedor.MarcarEnviandoAsync(reservado.Id, reservado.IdReserva, default)
                : perdedor.CancelarAsync(reservado.Id, "cancelar", default);
            await pausa.Leido.Task.WaitAsync(TimeSpan.FromSeconds(10));
            try
            {
                if (ganaCancelar) await ganador.CancelarAsync(reservado.Id, "cancelar", default);
                else await ganador.MarcarEnviandoAsync(reservado.Id, reservado.IdReserva, default);
            }
            finally { pausa.Continuar.TrySetResult(); }
            var error = await Assert.ThrowsAsync<ExcepcionEstacionImpresion>(() => pendiente);
            Assert.Equal(ganaCancelar ? "RESERVA_TRABAJO_IMPRESION_INVALIDA" : "TRABAJO_NO_CANCELABLE", error.Codigo);
            setup.ChangeTracker.Clear();
            Assert.Equal(ganaCancelar ? EstadoTrabajoImpresion.Cancelado : EstadoTrabajoImpresion.Enviando,
                (await setup.TrabajosImpresion.SingleAsync()).Estado);
        });
    }

    private sealed class PausarGuardado : SaveChangesInterceptor
    {
        public TaskCompletionSource Leido { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public TaskCompletionSource Continuar { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData,
            InterceptionResult<int> result, CancellationToken cancellationToken = default)
        {
            Leido.TrySetResult();
            await Continuar.Task.WaitAsync(TimeSpan.FromSeconds(15), cancellationToken);
            return result;
        }
    }

    private sealed class PausarPrimerGuardado : SaveChangesInterceptor
    {
        private int pausas;
        public TaskCompletionSource Guardando { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public TaskCompletionSource Continuar { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData,
            InterceptionResult<int> result, CancellationToken cancellationToken = default)
        {
            if (Interlocked.Increment(ref pausas) != 1) return result;
            Guardando.TrySetResult();
            await Continuar.Task.WaitAsync(TimeSpan.FromSeconds(15), cancellationToken);
            return result;
        }
    }

    internal static async Task ConBaseAisladaAsync(Func<DbContextOptions<AppDbContext>, Task> comprobar)
    {
        var adminConnection = Environment.GetEnvironmentVariable("BARMASTER_TEST_POSTGRES_ADMIN");
        Assert.False(string.IsNullOrWhiteSpace(adminConnection), "Configure BARMASTER_TEST_POSTGRES_ADMIN con un PostgreSQL aislado; esta prueba no puede omitirse.");
        var databaseName = $"barmaster_print_test_{Guid.NewGuid():N}";
        Assert.StartsWith("barmaster_print_test_", databaseName);
        var adminBuilder = new NpgsqlConnectionStringBuilder(adminConnection);
        await using (var admin = new NpgsqlConnection(adminBuilder.ConnectionString))
        {
            await admin.OpenAsync();
            await using var create = new NpgsqlCommand($"CREATE DATABASE \"{databaseName}\"", admin);
            await create.ExecuteNonQueryAsync();
        }
        try
        {
            var testBuilder = new NpgsqlConnectionStringBuilder(adminBuilder.ConnectionString) { Database = databaseName };
            var options = new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(testBuilder.ConnectionString).Options;
            await using (var setup = new AppDbContext(options)) await setup.Database.MigrateAsync();
            await comprobar(options);
        }
        finally
        {
            await using var admin = new NpgsqlConnection(adminBuilder.ConnectionString);
            await admin.OpenAsync();
            await using var terminate = new NpgsqlCommand("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = @name", admin);
            terminate.Parameters.AddWithValue("name", databaseName); await terminate.ExecuteNonQueryAsync();
            await using var drop = new NpgsqlCommand($"DROP DATABASE \"{databaseName}\"", admin); await drop.ExecuteNonQueryAsync();
        }
    }

    internal static ServicioTrabajoImpresion CrearServicio(AppDbContext db, Guid branchId, Guid? stationId, string authType)
    {
        var identity = new IdentidadImpresionFalsa { IdSucursal = branchId, IdEstacion = stationId, TipoAutenticacion = authType };
        var options = Options.Create(new OpcionesImpresionDistribuida()); var current = new ContextoDbActualFalso(db);
        return new(current, identity, new ServicioReglaImpresion(current, identity, options, TimeProvider.System), new NotificadorFalso(), options, TimeProvider.System);
    }

    internal static async Task<(Guid BranchId, Guid IdEstacion)> SeedAsync(AppDbContext db)
    {
        var company = new Empresa { Nombre = "Empresa", Username = Guid.NewGuid().ToString("N"), Activo = true }; company.EstablecerContrasena([1], [2]);
        var branch = new Sucursal { Id = Guid.NewGuid(), IdEmpresa = company.Id, Empresa = company, Nombre = "Sucursal", Username = Guid.NewGuid().ToString("N") }; branch.EstablecerContrasena([1], [2]);
        var station = new EstacionImpresion { IdSucursal = branch.Id, IdInstalacionCliente = Guid.NewGuid(), Nombre = "Caja", VistaPorUltimaVezEn = DateTime.UtcNow };
        var printer = new Impresora { Estacion = station, NombreSistema = "Printer", NombreSistemaNormalizado = "PRINTER", NombreVisible = "Principal", Presente = true, VistaPorUltimaVezEn = DateTime.UtcNow, ActualizadoEn = DateTime.UtcNow };
        var route = new ReglaImpresion { IdSucursal = branch.Id, Impresora = printer, TipoSalida = TipoSalidaImpresion.Ticket, Momento = MomentoImpresion.AlGenerarPreticket, CreadoEn = DateTime.UtcNow, ActualizadoEn = DateTime.UtcNow };
        db.AddRange(branch, station, printer, route); await db.SaveChangesAsync(); return (branch.Id, station.Id);
    }
    private sealed class NotificadorFalso : INotificadorImpresion { public Task TrabajosDisponiblesAsync(IEnumerable<Guid> idsEstacion, CancellationToken tokenCancelacion) => Task.CompletedTask; }
}
