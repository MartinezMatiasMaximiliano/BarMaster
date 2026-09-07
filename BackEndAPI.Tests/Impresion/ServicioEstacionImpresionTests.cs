using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Models.Impresion;
using BackEndAPI.Impresion.Estaciones;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace BackEndAPI.Tests.Impresion;

public sealed class ServicioEstacionImpresionTests
{
    [Fact]
    public async Task RegistroEsIdempotenteDentroDeSucursal()
    {
        await using var db = CrearDb();
        var sucursalId = Guid.NewGuid();
        db.Sucursales.Add(CrearSucursal(sucursalId));
        await db.SaveChangesAsync();
        var service = CrearServicio(db, sucursalId);
        var installationId = Guid.NewGuid();

        var first = await service.RegistrarAsync(new(installationId, "Caja 1"), default);
        var second = await service.RegistrarAsync(new(installationId, "Caja principal"), default);

        Assert.Equal(first.Id, second.Id);
        Assert.Equal("Caja principal", second.Nombre);
        Assert.Single(db.EstacionesImpresion);
    }

    [Fact]
    public async Task NoSePuedeUsarEstacionDeOtraSucursal()
    {
        await using var db = CrearDb();
        var ownerSucursal = Guid.NewGuid();
        var requesterSucursal = Guid.NewGuid();
        db.Sucursales.AddRange(CrearSucursal(ownerSucursal), CrearSucursal(requesterSucursal));
        var station = new EstacionImpresion { IdSucursal = ownerSucursal, IdInstalacionCliente = Guid.NewGuid(), Nombre = "Caja" };
        db.EstacionesImpresion.Add(station);
        await db.SaveChangesAsync();

        Assert.False(await CrearServicio(db, requesterSucursal).PuedeUsarAsync(station.Id, default));
    }

    [Fact]
    public async Task UnaInstalacionPuedeRegistrarEstacionesIndependientesEnDosSucursales()
    {
        await using var db = CrearDb();
        var firstSucursal = Guid.NewGuid();
        var secondSucursal = Guid.NewGuid();
        var installationId = Guid.NewGuid();
        db.Sucursales.AddRange(CrearSucursal(firstSucursal), CrearSucursal(secondSucursal));
        await db.SaveChangesAsync();

        var first = await CrearServicio(db, firstSucursal).RegistrarAsync(new(installationId, "Caja A"), default);
        var second = await CrearServicio(db, secondSucursal).RegistrarAsync(new(installationId, "Caja B"), default);

        Assert.NotEqual(first.Id, second.Id);
        Assert.Equal(2, await db.EstacionesImpresion.CountAsync());
    }

    private static AppDbContext CrearDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new AppDbContext(options);
    }

    private static ServicioEstacionImpresion CrearServicio(AppDbContext db, Guid sucursalId) =>
        new(new ContextoDbActualFalso(db), new IdentidadImpresionFalsa { IdSucursal = sucursalId }, TimeProvider.System);

    private static Sucursal CrearSucursal(Guid id)
    {
        var sucursal = new Sucursal
        {
            Id = id,
            IdEmpresa = Guid.NewGuid(),
            Nombre = "Sucursal",
            Username = $"sucursal-{id:N}"
        };
        sucursal.EstablecerContrasena([1], [2]);
        return sucursal;
    }
}
