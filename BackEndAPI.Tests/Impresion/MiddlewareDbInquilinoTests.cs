using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Tenancy.Models;
using BackEndAPI.Tenancy.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;

namespace BackEndAPI.Tests.Impresion;

public sealed class MiddlewareDbInquilinoTests
{
    [Fact]
    public async Task HubImpresionDeEstacionUsaTenantFirmadoCuandoElNavegadorNoPuedeEnviarHeader()
    {
        var nextCalled = false;
        var middleware = new TenantDbMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });
        var context = new DefaultHttpContext();
        context.Request.Path = "/hubs/impresion/negotiate";
        context.User = new ClaimsPrincipal(new ClaimsIdentity(
            [new Claim("TenantId", " Tenant-A "), new Claim("TipoAuth", "estacion_impresion")],
            authenticationType: "test"));
        var accessor = new HttpContextAccessor { HttpContext = context };
        var services = new ServiceCollection()
            .AddSingleton<ITenantServices>(new ServicioTenantFalso())
            .AddSingleton<IHttpContextAccessor>(accessor)
            .BuildServiceProvider();
        context.RequestServices = services;

        await middleware.InvokeAsync(context, new AppDbContextFactory(services));

        Assert.True(nextCalled);
        Assert.Equal("tenant-a", context.Request.Headers["X-Tenant-ID"].ToString());
    }

    [Fact]
    public async Task SolicitudComunSinHeaderTenantContinuaSiendoRechazada()
    {
        var nextCalled = false;
        var middleware = new TenantDbMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });
        var context = new DefaultHttpContext();
        context.Request.Path = "/Productos";
        context.User = new ClaimsPrincipal(new ClaimsIdentity(
            [new Claim("TenantId", "tenant-a"), new Claim("TipoAuth", "estacion_impresion")],
            authenticationType: "test"));
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context, null!);

        Assert.False(nextCalled);
        Assert.Equal(StatusCodes.Status403Forbidden, context.Response.StatusCode);
    }

    [Fact]
    public async Task SolicitudAutenticadaConOtroInquilinoSeRechazaAntesDeResolverBase()
    {
        var nextCalled = false;
        var middleware = new TenantDbMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });
        var context = new DefaultHttpContext();
        context.User = new ClaimsPrincipal(new ClaimsIdentity(
            [new Claim("TenantId", "tenant-a")],
            authenticationType: "test"));
        context.Request.Headers["X-Tenant-ID"] = "tenant-b";
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context, null!);

        Assert.False(nextCalled);
        Assert.Equal(StatusCodes.Status403Forbidden, context.Response.StatusCode);
        context.Response.Body.Position = 0;
        var body = await new StreamReader(context.Response.Body).ReadToEndAsync();
        Assert.Contains("TENANT_MISMATCH", body);
    }

    private sealed class ServicioTenantFalso : ITenantServices
    {
        private static readonly Tenant Tenant = new()
        {
            NombreEmpresa = "tenant-a",
            NombreDB = "tenant_a",
            ConnectionString = "Host=localhost;Database=tenant_a;Username=test;Password=test"
        };

        public Task<Tenant?> BuscarTenantPorHttpContext(HttpContext httpContext) => Task.FromResult<Tenant?>(Tenant);
        public Task<Tenant?> BuscarTenantPorNombreEmpresa(string nombreEmpresa) => Task.FromResult<Tenant?>(Tenant);
        public Task<Tenant> CrearTenant(Empresa request) => Task.FromResult(Tenant);
    }
}
