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
}
