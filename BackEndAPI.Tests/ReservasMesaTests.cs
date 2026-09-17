using System.Security.Claims;
using BackEndAPI.Controllers;
using BackEndAPI.Data;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Repositories;
using BackEndAPI.Services;
using BackEndAPI.Tenancy.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Tests;

public class ReservasMesaTests
{
    private sealed class Contexto(AppDbContext db) : ICurrentDbContext { public AppDbContext Db => db; }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(4)]
    [InlineData(99)]
    public async Task CrearYEditarRechazanEstadosNoPermitidosConBadRequest(int estado)
    {
        var controller = new ReservasController(new ReservasServices(null!))
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(
                    [new Claim("IdSucursal", Guid.NewGuid().ToString())], "Test")) }
            }
        };
        var alta = await controller.CrearReserva(new CrearReservaDTO
        {
            IdEstadoReserva = estado, FechaHora = DateTime.UtcNow.AddDays(1), NombreReserva = "Ana", Telefono = "1155551234"
        });
        Assert.IsType<BadRequestObjectResult>(alta);
        Assert.IsType<BadRequestObjectResult>(await controller.ModificarReserva(new ModificarReservaDTO { IdEstadoReserva = estado }));
    }

    [Theory]
    [InlineData(2)]
    [InlineData(3)]
    public async Task PermiteCrearYEditarConLosDosEstados(int estado)
    {
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        await db.Database.EnsureCreatedAsync();
        Assert.Equal(new[] { 2, 3 }, await db.EstadoReservas.OrderBy(e => e.Id).Select(e => e.Id).ToArrayAsync());
        var servicio = new ReservasServices(new ReservasRepository(new Contexto(db)));
        var reserva = await servicio.CrearReserva(new CrearReservaDTO
        {
            IdEstadoReserva = estado, NombreReserva = "Ana", Telefono = "1155551234", FechaHora = DateTime.UtcNow.AddDays(1)
        }, Guid.NewGuid());
        Assert.Equal(estado, reserva.IdEstadoReserva);
        var otroEstado = estado == 2 ? 3 : 2;
        await servicio.ActualizarReserva(new ModificarReservaDTO { Id = reserva.Id, IdEstadoReserva = otroEstado }, reserva.IdSucursal);
        Assert.Equal(otroEstado, (await db.Reservas.SingleAsync()).IdEstadoReserva);
    }

    [Fact]
    public async Task CrearYConsultarReservasDevuelveMesaReservada()
    {
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        await db.Database.EnsureCreatedAsync();
        var sucursal = Guid.NewGuid();
        var mesa = new Mesa { Numero = 7, Plano = new Plano { Id = Guid.NewGuid(), IdSucursal = sucursal, Nombre = "Salón" } };
        db.Mesas.Add(mesa);
        await db.SaveChangesAsync();
        var servicio = new ReservasServices(new ReservasRepository(new Contexto(db)));
        var controller = new ReservasController(servicio) { ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(
                [new Claim("IdSucursal", sucursal.ToString())], "Test")) }
        } };
        var fecha = DateTime.Now.AddDays(1);
        var creada = Assert.IsType<ReservaDTO>(Assert.IsType<OkObjectResult>(await controller.CrearReserva(
            new CrearReservaDTO { NombreReserva = "Ana", Telefono = "1155551234", FechaHora = fecha,
                IdEstadoReserva = 2, CantidadDePersonas = 4, IdMesa = mesa.Id })).Value);
        Assert.Equal(mesa.Id, creada.IdMesa);
        Assert.Equal("7", creada.MesaReserva);
        var todas = Assert.IsAssignableFrom<IEnumerable<ReservaDTO>>(
            Assert.IsType<OkObjectResult>(await controller.GetReservas()).Value);
        Assert.Equal("7", Assert.Single(todas).MesaReserva);
        var porFecha = Assert.IsAssignableFrom<IEnumerable<ReservaDTO>>(
            Assert.IsType<OkObjectResult>(await controller.GetReservasPorRangoFechas(fecha, null)).Value);
        Assert.Equal("7", Assert.Single(porFecha).MesaReserva);
    }

    [Fact]
    public async Task EditarPermiteCambiarConservarYQuitarMesa()
    {
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        await db.Database.EnsureCreatedAsync();
        var servicio = new ReservasServices(new ReservasRepository(new Contexto(db)));
        var sucursal = Guid.NewGuid();
        var plano = new Plano { Id = Guid.NewGuid(), IdSucursal = sucursal, Nombre = "Salón" };
        var mesa1 = new Mesa { Numero = 1, Plano = plano };
        var mesa2 = new Mesa { Numero = 2, Plano = plano };
        db.Mesas.AddRange(mesa1, mesa2);
        await db.SaveChangesAsync();
        var reserva = await servicio.CrearReserva(new CrearReservaDTO { NombreReserva = "Ana",
            Telefono = "1155551234", FechaHora = DateTime.Now.AddDays(1), IdEstadoReserva = 2,
            IdMesa = mesa1.Id }, sucursal);
        var editar = new ModificarReservaDTO { Id = reserva.Id, IdEstadoReserva = 2,
            FechaHora = reserva.FechaHora, IdMesa = mesa2.Id };
        await servicio.ActualizarReserva(editar, sucursal);
        Assert.Equal(mesa2.Id, (await db.Reservas.SingleAsync()).IdMesa);
        editar = new ModificarReservaDTO { Id = reserva.Id, IdEstadoReserva = 2, NombreReserva = "Nombre actualizado" };
        await servicio.ActualizarReserva(editar, sucursal);
        Assert.Equal(mesa2.Id, (await db.Reservas.SingleAsync()).IdMesa);
        editar.IdMesa = null;
        await servicio.ActualizarReserva(editar, sucursal);
        Assert.Null((await db.Reservas.SingleAsync()).IdMesa);
    }

    [Fact]
    public async Task RechazaMesaInexistenteODeOtraSucursal()
    {
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var mesa = new Mesa { Numero = 3, Plano = new Plano { Id = Guid.NewGuid(), IdSucursal = Guid.NewGuid(), Nombre = "Otro salón" } };
        db.Mesas.Add(mesa);
        await db.SaveChangesAsync();
        var servicio = new ReservasServices(new ReservasRepository(new Contexto(db)));
        foreach (var id in new[] { mesa.Id, Guid.NewGuid(), Guid.Empty })
        {
            var error = await Assert.ThrowsAsync<Exception>(() => servicio.CrearReserva(new CrearReservaDTO { IdMesa = id }, Guid.NewGuid()));
            Assert.Equal("La mesa no pertenece a la sucursal", error.Message);
        }
        Assert.Empty(db.Reservas);
    }

    [Fact]
    public async Task UnaSucursalNoPuedeListarModificarNiEliminarReservasDeOtra()
    {
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        await db.Database.EnsureCreatedAsync();
        var propia = Guid.NewGuid();
        var ajena = Guid.NewGuid();
        var servicio = new ReservasServices(new ReservasRepository(new Contexto(db)));
        var reservaPropia = await servicio.CrearReserva(new CrearReservaDTO
        {
            NombreReserva = "Propia", Telefono = "1", FechaHora = DateTime.UtcNow.AddDays(1)
        }, propia);
        var reservaAjena = await servicio.CrearReserva(new CrearReservaDTO
        {
            NombreReserva = "Ajena", Telefono = "2", FechaHora = DateTime.UtcNow.AddDays(1)
        }, ajena);
        var controller = new ReservasController(servicio) { ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(
                [new Claim("IdSucursal", propia.ToString())], "Test")) }
        } };

        var listado = Assert.IsAssignableFrom<IEnumerable<ReservaDTO>>(
            Assert.IsType<OkObjectResult>(await controller.GetReservas()).Value);
        Assert.Equal(reservaPropia.Id, Assert.Single(listado).Id);
        Assert.IsType<NotFoundObjectResult>(await controller.ModificarReserva(new ModificarReservaDTO
        {
            Id = reservaAjena.Id, IdEstadoReserva = 2, NombreReserva = "Intrusión"
        }));
        Assert.IsType<NotFoundObjectResult>(await controller.EliminarReserva(reservaAjena.Id));
        Assert.Equal("Ajena", (await db.Reservas.SingleAsync(x => x.Id == reservaAjena.Id)).NombreReserva);
    }

    [Fact]
    public async Task NormalizaAlMinutoYRechazaConflictoAlCrearYModificar()
    {
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        await db.Database.EnsureCreatedAsync();
        var sucursal = Guid.NewGuid();
        var plano = new Plano { IdSucursal = sucursal, Nombre = "Salón" };
        var mesa1 = new Mesa { Numero = 1, Plano = plano };
        var mesa2 = new Mesa { Numero = 2, Plano = plano };
        db.Mesas.AddRange(mesa1, mesa2);
        await db.SaveChangesAsync();
        var servicio = new ReservasServices(new ReservasRepository(new Contexto(db)));
        var fecha = new DateTime(2030, 1, 2, 15, 4, 59, 987, DateTimeKind.Utc);
        var primera = await servicio.CrearReserva(new CrearReservaDTO
        {
            NombreReserva = "Una", Telefono = "1", FechaHora = fecha, IdMesa = mesa1.Id
        }, sucursal);
        Assert.Equal(new DateTime(2030, 1, 2, 15, 4, 0, DateTimeKind.Utc), primera.FechaHora);

        var conflicto = await Assert.ThrowsAsync<Exception>(() => servicio.CrearReserva(new CrearReservaDTO
        {
            NombreReserva = "Dos", Telefono = "2", FechaHora = fecha.AddSeconds(-40), IdMesa = mesa1.Id
        }, sucursal));
        Assert.Equal("La mesa ya tiene una reserva confirmada en ese horario", conflicto.Message);
        var segunda = await servicio.CrearReserva(new CrearReservaDTO
        {
            NombreReserva = "Dos", Telefono = "2", FechaHora = fecha, IdMesa = mesa2.Id
        }, sucursal);
        await Assert.ThrowsAsync<Exception>(() => servicio.ActualizarReserva(new ModificarReservaDTO
        {
            Id = segunda.Id, IdEstadoReserva = 2, FechaHora = fecha, IdMesa = mesa1.Id
        }, sucursal));
    }

    [Fact]
    public async Task DisponibilidadAplicaLimitesIgnoraCanceladasYOtrasSucursales()
    {
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        await db.Database.EnsureCreatedAsync();
        var sucursal = Guid.NewGuid();
        var otra = Guid.NewGuid();
        var plano = new Plano { IdSucursal = sucursal, Nombre = "Salón" };
        var mesas = Enumerable.Range(0, 7).Select(i => new Mesa { Numero = i + 1, Plano = plano }).ToArray();
        var mesaOtra = new Mesa { Numero = 99, Plano = new Plano { IdSucursal = otra, Nombre = "Otro" } };
        db.Mesas.AddRange(mesas.Append(mesaOtra));
        var baseUtc = new DateTime(2030, 1, 2, 20, 0, 0, DateTimeKind.Utc);
        db.Reservas.AddRange(
            new Reserva { IdSucursal = sucursal, IdMesa = mesas[0].Id, FechaHora = baseUtc, IdEstadoReserva = 2, NombreReserva = "0", Telefono = "1" },
            new Reserva { IdSucursal = sucursal, IdMesa = mesas[1].Id, FechaHora = baseUtc.AddMinutes(-30), IdEstadoReserva = 2, NombreReserva = "30", Telefono = "1" },
            new Reserva { IdSucursal = sucursal, IdMesa = mesas[2].Id, FechaHora = baseUtc.AddMinutes(31), IdEstadoReserva = 2, NombreReserva = "31", Telefono = "1" },
            new Reserva { IdSucursal = sucursal, IdMesa = mesas[3].Id, FechaHora = baseUtc.AddMinutes(-89), IdEstadoReserva = 2, NombreReserva = "89", Telefono = "1" },
            new Reserva { IdSucursal = sucursal, IdMesa = mesas[4].Id, FechaHora = baseUtc.AddMinutes(90), IdEstadoReserva = 2, NombreReserva = "90", Telefono = "1" },
            new Reserva { IdSucursal = sucursal, IdMesa = mesas[5].Id, FechaHora = baseUtc.AddMinutes(5), IdEstadoReserva = 3, NombreReserva = "Cancelada", Telefono = "1" },
            new Reserva { IdSucursal = otra, IdMesa = mesaOtra.Id, FechaHora = baseUtc, IdEstadoReserva = 2, NombreReserva = "Otra", Telefono = "1" });
        await db.SaveChangesAsync();
        var servicio = new ReservasServices(new ReservasRepository(new Contexto(db)));

        var resultado = await servicio.BuscarDisponibilidad(sucursal, new DateTimeOffset(baseUtc));

        Assert.DoesNotContain(resultado, x => x.Id == mesas[0].Id);
        Assert.Equal("roja", resultado.Single(x => x.Id == mesas[1].Id).EstadoDisponibilidad);
        Assert.Equal("amarilla", resultado.Single(x => x.Id == mesas[2].Id).EstadoDisponibilidad);
        Assert.Equal("amarilla", resultado.Single(x => x.Id == mesas[3].Id).EstadoDisponibilidad);
        Assert.Equal("verde", resultado.Single(x => x.Id == mesas[4].Id).EstadoDisponibilidad);
        Assert.Null(resultado.Single(x => x.Id == mesas[5].Id).DistanciaReservaMinutos);
        Assert.DoesNotContain(resultado, x => x.Id == mesaOtra.Id);
    }
}
