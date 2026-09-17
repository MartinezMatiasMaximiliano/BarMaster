using BackEndAPI.Data;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories;
using BackEndAPI.Services;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Tests;

public class MesasNumeroTests
{
    private sealed class Contexto(AppDbContext db) : ICurrentDbContext { public AppDbContext Db => db; }

    [Fact]
    public async Task CrearEditarYConservarNumeroControlaDuplicadosPorPlano()
    {
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var contexto = new Contexto(db);
        var servicio = new MesasServices(new MesasRepository(contexto), null!, null!, null!, new PlanosRepository(contexto));
        var plano = new Plano { Nombre = "Salón" };
        var otroPlano = new Plano { Nombre = "Terraza" };
        db.Planos.AddRange(plano, otroPlano);
        await db.SaveChangesAsync();

        var mesa = (await servicio.CrearMesa(new CrearMesaDTO { Numero = 7, IdPlano = plano.Id, Capacidad = 4 }))!;
        Assert.Equal(7, mesa.Numero);
        await Assert.ThrowsAsync<Exception>(() => servicio.CrearMesa(new CrearMesaDTO { Numero = 7, IdPlano = plano.Id }));
        Assert.Equal(7, (await servicio.CrearMesa(new CrearMesaDTO { Numero = 7, IdPlano = otroPlano.Id }))!.Numero);
        await servicio.CrearMesa(new CrearMesaDTO { Numero = 8, IdPlano = plano.Id });
        await Assert.ThrowsAsync<Exception>(() => servicio.ModificarMesa(new ModificarMesaDTO { Id = mesa.Id, Numero = 8 }));
        Assert.Equal(7, (await servicio.ModificarMesa(new ModificarMesaDTO { Id = mesa.Id, Numero = 7 }))!.Numero);
        Assert.Equal(12, (await servicio.ModificarMesa(new ModificarMesaDTO { Id = mesa.Id, Numero = 12 }))!.Numero);
        Assert.Equal(12, (await servicio.ModificarMesa(new ModificarMesaDTO { Id = mesa.Id, x = 3 }))!.Numero);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task RechazaNumeroNoPositivo(int numero)
    {
        var servicio = new MesasServices(null!, null!, null!, null!, null!);
        var alta = await Assert.ThrowsAsync<Exception>(() => servicio.CrearMesa(new CrearMesaDTO { Numero = numero }));
        var edicion = await Assert.ThrowsAsync<Exception>(() => servicio.ModificarMesa(new ModificarMesaDTO { Numero = numero }));
        Assert.Equal("El número de la mesa debe ser mayor que cero", alta.Message);
        Assert.Equal(alta.Message, edicion.Message);
    }
}
