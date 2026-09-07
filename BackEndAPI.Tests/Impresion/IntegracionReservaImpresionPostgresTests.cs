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

namespace BackEndAPI.Tests.Impresion;

public sealed class IntegracionReservaImpresionPostgresTests
{
    [Fact]
    public async Task SkipLockedPermiteQueSoloUnConsumidorReserveUnTrabajo()
    {
        var adminConnection = Environment.GetEnvironmentVariable("BARMASTER_TEST_POSTGRES_ADMIN");
        if (string.IsNullOrWhiteSpace(adminConnection)) return;
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
            Guid branchId; Guid stationId;
            await using (var setup = new AppDbContext(options))
            {
                await setup.Database.MigrateAsync();
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

    private static ServicioTrabajoImpresion CrearServicio(AppDbContext db, Guid branchId, Guid? stationId, string authType)
    {
        var identity = new IdentidadImpresionFalsa { IdSucursal = branchId, IdEstacion = stationId, TipoAutenticacion = authType };
        var options = Options.Create(new OpcionesImpresionDistribuida()); var current = new ContextoDbActualFalso(db);
        return new(current, identity, new ServicioReglaImpresion(current, identity, options, TimeProvider.System), new NotificadorFalso(), options, TimeProvider.System);
    }

    private static async Task<(Guid BranchId, Guid IdEstacion)> SeedAsync(AppDbContext db)
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
