using BackEndAPI.Controllers;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
namespace BackEndAPI.Tests.Contratos;
public class TipoEnvioContratoTests
{
    [Fact]
    public async Task ModificarDevuelveObjetoActualizado()
    {
        var servicio = DobleContrato.Crear<ITipoEnviosServices>((m,a) => Task.FromResult<TipoEnvio?>(new TipoEnvio { Id = 2, Nombre = "Moto", Precio = 0 }));
        var respuesta = Assert.IsType<OkObjectResult>(await new TipoEnviosController(servicio).ModificarTipoEnvio(2, new ModificarTipoEnvioDTO { Nombre = "Moto", Precio = 0 }));
        var tipo = Assert.IsType<TipoEnvioDTO>(respuesta.Value);
        Assert.Equal(2, tipo.Id); Assert.Equal("Moto", tipo.Nombre); Assert.Equal(0, tipo.Precio);
    }
}
