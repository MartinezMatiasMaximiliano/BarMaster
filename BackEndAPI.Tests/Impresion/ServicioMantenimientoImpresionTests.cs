using BackEndAPI.Data;
using BackEndAPI.Impresion;
using BackEndAPI.Impresion.Trabajos;
using BackEndAPI.Models.Impresion;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace BackEndAPI.Tests.Impresion;

public sealed class ServicioMantenimientoImpresionTests
{
    [Fact]
    public async Task MantieneBaseActualizadaYOmitelaQueNoTieneEsquema()
    {
        await IntegracionReservaImpresionPostgresTests.ConBaseAisladaAsync(async options =>
        {
            await using var db = new AppDbContext(options);
            var data = await IntegracionReservaImpresionPostgresTests.SeedAsync(db);
            var ahora = DateTime.UtcNow;
            var estados = new[] { EstadoTrabajoImpresion.Pendiente, EstadoTrabajoImpresion.Reservado,
                EstadoTrabajoImpresion.Enviando, EstadoTrabajoImpresion.Reservado };
            for (var i = 0; i < estados.Length; i++)
                db.TrabajosImpresion.Add(new TrabajoImpresion {
                    IdSucursal = data.BranchId, IdEstacion = data.IdEstacion, Estado = estados[i],
                    ClaveIdempotencia = $"mantenimiento-{i}", ContenidoJson = "{\"documento\":true}",
                    CreadoEn = ahora.AddDays(-40), VenceEn = i == 0 || i == 3 ? ahora.AddMinutes(-1) : ahora.AddMinutes(10),
                    IdReserva = Guid.NewGuid(), ReservaVenceEn = ahora.AddMinutes(-1)
                });
            await db.SaveChangesAsync();
            using var provider = new ServiceCollection().BuildServiceProvider();
            using var servicio = new ServicioMantenimientoImpresion(provider.GetRequiredService<IServiceScopeFactory>(),
                Options.Create(new OpcionesImpresionDistribuida()), TimeProvider.System,
                NullLogger<ServicioMantenimientoImpresion>.Instance);
            Assert.True(await servicio.MantenerSiCompatibleAsync(db, default));
            db.ChangeTracker.Clear();
            var trabajos = await db.TrabajosImpresion.OrderBy(x => x.ClaveIdempotencia).ToListAsync();
            Assert.Equal(EstadoTrabajoImpresion.Vencido, trabajos[0].Estado);
            Assert.Equal(EstadoTrabajoImpresion.ReintentoProgramado, trabajos[1].Estado);
            Assert.Equal(EstadoTrabajoImpresion.RequiereAtencion, trabajos[2].Estado);
            Assert.Equal(EstadoTrabajoImpresion.Vencido, trabajos[3].Estado);
            Assert.All(trabajos, x => Assert.Equal("{}", x.ContenidoJson));
            Assert.All(trabajos.Skip(1), x => Assert.Null(x.ReservaVenceEn));
            Assert.Equal("RESERVA_VENCIDA_DESPUES_ENVIO", trabajos[2].UltimoCodigoError);

            // Only this disposable test database is altered. No schema means no table access.
            await db.Database.ExecuteSqlRawAsync("DROP TABLE \"TrabajosImpresion\" CASCADE");
            await db.Database.ExecuteSqlRawAsync("DELETE FROM \"__EFMigrationsHistory\" WHERE \"MigrationId\" = '20260907175031_EspanolizarModuloImpresion'");
            Assert.False(await servicio.MantenerSiCompatibleAsync(db, default));
        });
    }
}
