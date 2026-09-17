using BackEndAPI.Data;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories;
using BackEndAPI.Services;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using BackEndAPI.Tests.Impresion;
using BackEndAPI.Services.Horario;

namespace BackEndAPI.Tests;

public sealed class ReservasConcurrenciaPostgresTests
{
    private sealed class Contexto(AppDbContext db) : ICurrentDbContext { public AppDbContext Db => db; }

    [Fact]
    public async Task DosAltasSimultaneasProducenExactamenteUnaReserva()
    {
        await IntegracionReservaImpresionPostgresTests.ConBaseAisladaAsync(async options =>
        {
            Guid sucursal; Guid mesa;
            await using (var setup = new AppDbContext(options))
            {
                var empresa = new Empresa { Nombre = "Empresa", Username = Guid.NewGuid().ToString("N"), Activo = true };
                empresa.EstablecerContrasena([1], [2]);
                var branch = new Sucursal { IdEmpresa = empresa.Id, Empresa = empresa, Nombre = "Sucursal", Username = Guid.NewGuid().ToString("N") };
                branch.EstablecerContrasena([1], [2]);
                var table = new Mesa { Numero = 1, Plano = new Plano { Nombre = "Salón", Sucursal = branch } };
                setup.Add(table);
                await setup.SaveChangesAsync();
                sucursal = branch.Id; mesa = table.Id;
            }
            await using var db1 = new AppDbContext(options);
            await using var db2 = new AppDbContext(options);
            var fecha = new DateTime(2030, 1, 2, 15, 4, 45, DateTimeKind.Utc);
            Task<Reserva> Crear(AppDbContext db, string nombre) =>
                new ReservasServices(new ReservasRepository(new Contexto(db)), new ServicioHorarioBuenosAires(TimeProvider.System)).CrearReserva(new CrearReservaDTO
                { NombreReserva = nombre, Telefono = "1", FechaHora = fecha, IdMesa = mesa }, sucursal);
            var solicitudes = new[] { Crear(db1, "Una"), Crear(db2, "Dos") };
            try { await Task.WhenAll(solicitudes); } catch { }

            Assert.Equal(1, solicitudes.Count(x => x.Status == TaskStatus.RanToCompletion));
            await using var verificar = new AppDbContext(options);
            Assert.Single(await verificar.Reservas.Where(x => x.IdSucursal == sucursal).ToListAsync());
        });
    }
}
