using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Models.Printing;
using BackEndAPI.Printing.Stations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace BackEndAPI.Tests.Printing;

public sealed class PrintingStationServiceTests
{
    [Fact]
    public async Task RegistrationIsIdempotentWithinSucursal()
    {
        await using var db = CreateDb();
        var sucursalId = Guid.NewGuid();
        db.Sucursales.Add(CreateSucursal(sucursalId));
        await db.SaveChangesAsync();
        var service = CreateService(db, sucursalId);
        var installationId = Guid.NewGuid();

        var first = await service.RegisterAsync(new(installationId, "Caja 1"), default);
        var second = await service.RegisterAsync(new(installationId, "Caja principal"), default);

        Assert.Equal(first.Id, second.Id);
        Assert.Equal("Caja principal", second.Name);
        Assert.Single(db.PrintingStations);
    }

    [Fact]
    public async Task StationFromAnotherSucursalCannotBeUsed()
    {
        await using var db = CreateDb();
        var ownerSucursal = Guid.NewGuid();
        var requesterSucursal = Guid.NewGuid();
        db.Sucursales.AddRange(CreateSucursal(ownerSucursal), CreateSucursal(requesterSucursal));
        var station = new PrintingStation { IdSucursal = ownerSucursal, ClientInstallationId = Guid.NewGuid(), Name = "Caja" };
        db.PrintingStations.Add(station);
        await db.SaveChangesAsync();

        Assert.False(await CreateService(db, requesterSucursal).CanUseAsync(station.Id, default));
    }

    [Fact]
    public async Task OneInstallationCanRegisterIndependentStationsInTwoSucursales()
    {
        await using var db = CreateDb();
        var firstSucursal = Guid.NewGuid();
        var secondSucursal = Guid.NewGuid();
        var installationId = Guid.NewGuid();
        db.Sucursales.AddRange(CreateSucursal(firstSucursal), CreateSucursal(secondSucursal));
        await db.SaveChangesAsync();

        var first = await CreateService(db, firstSucursal).RegisterAsync(new(installationId, "Caja A"), default);
        var second = await CreateService(db, secondSucursal).RegisterAsync(new(installationId, "Caja B"), default);

        Assert.NotEqual(first.Id, second.Id);
        Assert.Equal(2, await db.PrintingStations.CountAsync());
    }

    [Fact]
    public async Task AssignmentUpsertKeepsOneRolePerStation()
    {
        await using var db = CreateDb();
        var sucursalId = Guid.NewGuid();
        db.Sucursales.Add(CreateSucursal(sucursalId));
        await db.SaveChangesAsync();
        var service = CreateService(db, sucursalId);
        var station = await service.RegisterAsync(new(Guid.NewGuid(), "Caja"), default);

        await service.UpsertAssignmentAsync(station.Id, PrinterRole.Preticket, new("Printer A", PrintFormat.Raw, 80, 1, true), default);
        var updated = await service.UpsertAssignmentAsync(station.Id, PrinterRole.Preticket, new("Printer B", PrintFormat.Pdf, 58, 2, true), default);

        Assert.Equal("Printer B", updated.QzPrinterName);
        Assert.Single(db.PrinterAssignments);
    }

    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new AppDbContext(options);
    }

    private static PrintingStationService CreateService(AppDbContext db, Guid sucursalId) =>
        new(new FakeCurrentDbContext(db), new FakePrintingIdentity { SucursalId = sucursalId }, TimeProvider.System);

    private static Sucursal CreateSucursal(Guid id)
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
