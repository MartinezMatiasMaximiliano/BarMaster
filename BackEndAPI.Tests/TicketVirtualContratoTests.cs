using BackEndAPI.Controllers;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Tests.Contratos;

public class TicketVirtualContratoTests
{
    [Fact]
    public async Task TicketIncluyeEmpresaSucursalYTotalDelPago()
    {
        var pago = new MovimientoCaja {
            MontoTotal = 2500.5m,
            Caja = new Caja { Sucursal = new Sucursal {
                Nombre = "Centro", Empresa = new Empresa { Nombre = "Empresa del Café" }
            } }
        };
        var servicio = DobleContrato.Crear<IMovimientosCajaServices>((metodo, args) => Task.FromResult(pago));
        var respuesta = Assert.IsType<OkObjectResult>(await new TicketController(servicio).GetTicket(pago.Id));
        var ticket = Assert.IsType<TicketVirtualDTO>(respuesta.Value);
        Assert.Equal("Empresa del Café", ticket.NombreEmpresa);
        Assert.Equal("Centro", ticket.NombreSucursal);
        Assert.Equal(2500.5m, ticket.MontoTotal);
    }
}
