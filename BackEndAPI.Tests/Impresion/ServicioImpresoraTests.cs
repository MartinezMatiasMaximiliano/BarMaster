using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Models.Impresion;
using BackEndAPI.Impresion;
using BackEndAPI.Impresion.Dispositivos;
using BackEndAPI.Impresion.Estaciones;
using BackEndAPI.Impresion.Reglas;
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

    [Fact]
    public async Task Eliminar_ExigeQuitarPrimeroLasReglasAsociadas()
    {
        var idSucursal = Guid.NewGuid();
        var estacion = new EstacionImpresion
        {
            Id = Guid.NewGuid(), IdSucursal = idSucursal, IdInstalacionCliente = Guid.NewGuid(), Nombre = "Caja"
        };
        var impresora = new Impresora
        {
            Estacion = estacion, NombreSistema = "KP-1025", NombreSistemaNormalizado = "KP-1025", NombreVisible = "Cocina"
        };
        var regla = new ReglaImpresion
        {
            IdSucursal = idSucursal, Impresora = impresora, TipoSalida = TipoSalidaImpresion.Comanda,
            Momento = MomentoImpresion.AlCargarProductosMesa
        };
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.AddRange(estacion, impresora, regla);
        await db.SaveChangesAsync();
        var identidad = new IdentidadImpresionFalsa { IdSucursal = idSucursal, TipoAutenticacion = "sucursal" };
        var opciones = Options.Create(new OpcionesImpresionDistribuida());
        var contexto = new ContextoDbActualFalso(db);
        var servicioImpresora = new ServicioImpresora(contexto, identidad, opciones, TimeProvider.System);

        var excepcion = await Assert.ThrowsAsync<ExcepcionEstacionImpresion>(
            () => servicioImpresora.EliminarAsync(impresora.Id, default));
        Assert.Equal("IMPRESORA_CON_REGLAS", excepcion.Codigo);

        await new ServicioReglaImpresion(contexto, identidad, opciones, TimeProvider.System)
            .EliminarAsync(regla.Id, default);
        await servicioImpresora.EliminarAsync(impresora.Id, default);

        Assert.Empty(db.Impresoras);
        Assert.Empty(db.ReglasImpresion);
    }

    [Fact]
    public async Task ActualizarYEliminarImpresora_SeBloqueanMientrasHayCajaActiva()
    {
        var idSucursal = Guid.NewGuid();
        var estacion = new EstacionImpresion
        {
            IdSucursal = idSucursal, IdInstalacionCliente = Guid.NewGuid(), Nombre = "Caja"
        };
        var impresora = new Impresora
        {
            Estacion = estacion, NombreSistema = "KP-1025", NombreSistemaNormalizado = "KP-1025", NombreVisible = "Cocina"
        };
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.AddRange(estacion, impresora, new Caja { IdSucursal = idSucursal, FechaCierre = null });
        await db.SaveChangesAsync();
        var servicio = new ServicioImpresora(
            new ContextoDbActualFalso(db),
            new IdentidadImpresionFalsa { IdSucursal = idSucursal, TipoAutenticacion = "sucursal" },
            Options.Create(new OpcionesImpresionDistribuida()),
            TimeProvider.System);

        var excepcionActualizar = await Assert.ThrowsAsync<ExcepcionEstacionImpresion>(() =>
            servicio.ActualizarAsync(impresora.Id, new("Barra", 58, "CP858", true), default));
        var excepcionEliminar = await Assert.ThrowsAsync<ExcepcionEstacionImpresion>(() =>
            servicio.EliminarAsync(impresora.Id, default));

        Assert.Equal("CONFIGURACION_IMPRESION_BLOQUEADA_CAJA_ACTIVA", excepcionActualizar.Codigo);
        Assert.Equal("CONFIGURACION_IMPRESION_BLOQUEADA_CAJA_ACTIVA", excepcionEliminar.Codigo);
        Assert.Equal("Cocina", (await db.Impresoras.SingleAsync()).NombreVisible);
    }

    [Fact]
    public async Task EliminarRegla_SeBloqueaMientrasHayCajaActiva()
    {
        var idSucursal = Guid.NewGuid();
        var estacion = new EstacionImpresion
        {
            IdSucursal = idSucursal, IdInstalacionCliente = Guid.NewGuid(), Nombre = "Caja"
        };
        var impresora = new Impresora
        {
            Estacion = estacion, NombreSistema = "KP-1025", NombreSistemaNormalizado = "KP-1025", NombreVisible = "Cocina"
        };
        var regla = new ReglaImpresion
        {
            IdSucursal = idSucursal, Impresora = impresora, TipoSalida = TipoSalidaImpresion.Comanda,
            Momento = MomentoImpresion.AlCargarProductosMesa
        };
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.AddRange(estacion, impresora, regla, new Caja { IdSucursal = idSucursal, FechaCierre = null });
        await db.SaveChangesAsync();
        var servicio = new ServicioReglaImpresion(
            new ContextoDbActualFalso(db),
            new IdentidadImpresionFalsa { IdSucursal = idSucursal, TipoAutenticacion = "sucursal" },
            Options.Create(new OpcionesImpresionDistribuida()),
            TimeProvider.System);

        var excepcion = await Assert.ThrowsAsync<ExcepcionEstacionImpresion>(() =>
            servicio.EliminarAsync(regla.Id, default));

        Assert.Equal("CONFIGURACION_IMPRESION_BLOQUEADA_CAJA_ACTIVA", excepcion.Codigo);
        Assert.Single(db.ReglasImpresion);
    }
}
