using BackEndAPI.Data;
using BackEndAPI.Models.Impresion;
using BackEndAPI.Impresion;
using BackEndAPI.Impresion.Dispositivos;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BackEndAPI.Tests.Impresion;

public sealed class ServicioImpresoraTests
{
    [Fact]
    public async Task Sincronizar_SiempreRestauraPerfilTermicoCrudoDeImpresoraDetectada()
    {
        var branchId = Guid.NewGuid();
        var stationId = Guid.NewGuid();
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.EstacionesImpresion.Add(new EstacionImpresion
        {
            Id = stationId,
            IdSucursal = branchId,
            IdInstalacionCliente = Guid.NewGuid(),
            Nombre = "Caja",
            Habilitada = true
        });
        db.Impresoras.Add(new Impresora
        {
            Id = Guid.NewGuid(),
            IdEstacion = stationId,
            NombreSistema = "KP-1025",
            NombreSistemaNormalizado = "KP-1025",
            NombreVisible = "Principal",
            // Simulates a legacy row created before printing became ESC/POS-only.
            Formato = (FormatoImpresion)2
        });
        await db.SaveChangesAsync();

        var service = new ServicioImpresora(
            new ContextoDbActualFalso(db),
            new IdentidadImpresionFalsa
            {
                IdSucursal = branchId,
                IdEstacion = stationId,
                TipoAutenticacion = "estacion_impresion"
            },
            Options.Create(new OpcionesImpresionDistribuida()),
            TimeProvider.System);

        var result = await service.SincronizarAsync(stationId,
            new SincronizarInventarioImpresorasSolicitud("web-test", "2.2.6",
                [new ImpresoraDetectadaSolicitud("KP-1025", null)]),
            CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(FormatoImpresion.Crudo, (await db.Impresoras.SingleAsync()).Formato);
    }
}
