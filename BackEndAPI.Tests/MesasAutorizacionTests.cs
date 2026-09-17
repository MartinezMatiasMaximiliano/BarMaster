using System.Net;
using System.Security.Claims;
using System.Text.Encodings.Web;
using BackEndAPI.Controllers;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BackEndAPI.Tests;

public sealed class MesasAutorizacionTests
{
    [Fact]
    public async Task EndpointsRequierenCredencialesYPermitenUsuarioAutenticado()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseTestServer();
        builder.Services.AddControllers().AddApplicationPart(typeof(MesasController).Assembly);
        builder.Services.AddSingleton<IMesasServices, MesasVacias>();
        builder.Services.AddAuthentication("Pruebas").AddScheme<AuthenticationSchemeOptions, AutenticacionPruebas>("Pruebas", null);
        builder.Services.AddAuthorization();
        await using var app = builder.Build();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        await app.StartAsync();
        var cliente = app.GetTestClient();

        Assert.Equal(HttpStatusCode.Unauthorized, (await cliente.GetAsync("/Mesa")).StatusCode);
        cliente.DefaultRequestHeaders.Add("X-Test-Auth", "usuario");
        Assert.Equal(HttpStatusCode.OK, (await cliente.GetAsync("/Mesa")).StatusCode);
    }

    private sealed class AutenticacionPruebas(
        IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
        : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
    {
        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (!Request.Headers.ContainsKey("X-Test-Auth"))
                return Task.FromResult(AuthenticateResult.NoResult());
            var principal = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.Name, "usuario")], Scheme.Name));
            return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal, Scheme.Name)));
        }
    }

    private sealed class MesasVacias : IMesasServices
    {
        public Task<Mesa?> CrearMesa(CrearMesaDTO request) => Task.FromResult<Mesa?>(null);
        public Task<Mesa?> ModificarMesa(ModificarMesaDTO request) => Task.FromResult<Mesa?>(null);
        public Task<Visita?> AbrirCerrarMesa(AbrirMesaDTO request) => Task.FromResult<Visita?>(null);
        public Task<IEnumerable<Mesa>> ObtenerTodasLasMesas() => Task.FromResult<IEnumerable<Mesa>>([]);
        public Task<IEnumerable<(Mesa mesa, Visita? visita)>> ObtenerTodasLasMesasConVisita() =>
            Task.FromResult<IEnumerable<(Mesa, Visita?)>>([]);
        public Task<bool> EliminarMesa(Guid idMesa) => Task.FromResult(false);
    }
}
