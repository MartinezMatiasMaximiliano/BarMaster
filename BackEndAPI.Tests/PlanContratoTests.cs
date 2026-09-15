using System.Security.Claims;
using BackEndAPI.Controllers;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
namespace BackEndAPI.Tests.Contratos;
public class PlanContratoTests
{
    [Fact]
    public async Task ConsultaUsaEmpresaDelTokenYNoInventaVigencia()
    {
        var empresaA = Guid.NewGuid(); var empresaB = Guid.NewGuid();
        var empresas = new Dictionary<Guid, Empresa> {
            [empresaA] = new Empresa { TipoSubscripcion = new TipoSubscripcion { Id = 1, Nombre = "Inicial", Precio = 0, Features = ["Mesas"] } },
            [empresaB] = new Empresa { TipoSubscripcion = null }
        };
        var servicio = DobleContrato.Crear<IEmpresasServices>((m,a) => Task.FromResult<Empresa?>(empresas[(Guid)a[0]!]));
        var controller = new EmpresasController(servicio) { ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() } };
        controller.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("IdEmpresa", empresaA.ToString())], "test"));
        var plan = Assert.IsType<PlanEmpresaDTO>(Assert.IsType<OkObjectResult>(await controller.ObtenerPlan()).Value);
        Assert.Equal((short)1, plan.Id); Assert.Equal("Inicial", plan.Nombre); Assert.Equal(0, plan.Precio); Assert.Equal(["Mesas"], plan.Prestaciones);
        controller.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("IdEmpresa", empresaB.ToString())], "test"));
        Assert.IsType<NoContentResult>(await controller.ObtenerPlan());
        controller.HttpContext.User = new ClaimsPrincipal();
        Assert.IsType<UnauthorizedObjectResult>(await controller.ObtenerPlan());
        Assert.NotNull(typeof(EmpresasController).GetMethod("ObtenerPlan")!.GetCustomAttributes(typeof(Microsoft.AspNetCore.Authorization.AuthorizeAttribute), false).Single());
    }
}
