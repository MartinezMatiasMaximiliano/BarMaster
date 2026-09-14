using BackEndAPI.Exceptions;
using BackEndAPI.Tenancy.Models;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Data
{
    public class AppDbContextFactory
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<AppDbContextFactory> _logger;

        public AppDbContextFactory(IServiceProvider services, ILogger<AppDbContextFactory> logger)
        {
            _services = services;
            _logger = logger;
        }

        public async Task<AppDbContext?> CreateAsync(HttpContext http)
        {
            var resolver = _services.GetRequiredService<ITenantServices>();
             var tenant = http.User?.Identity?.IsAuthenticated == true
                ? await ResolverPorToken(http, resolver)
                : await resolver.BuscarTenantPorHttpContext(http);

            if (tenant == null)
            {
                if (http.User?.Identity?.IsAuthenticated == true)
                {
                    throw new UnauthorizedException("La sesión no es válida. Volvé a iniciar sesión.");
                }

                _logger.LogWarning(
                    "No se pudo resolver el tenant para {Metodo} {Path}. Header X-Tenant-ID={TenantHeader}",
                    http.Request.Method,
                    http.Request.Path.Value,
                    http.Request.Headers.TryGetValue("X-Tenant-ID", out var header) ? header.ToString() : "(ausente)");
                return null;
            }

            http.Items["TenantId"] = tenant.Id;
            http.Items["TenantNombre"] = tenant.NombreEmpresa;
            http.Items["Tenant"] = tenant;

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseNpgsql(tenant.ConnectionString);

            return new AppDbContext(optionsBuilder.Options);
        }

        private static async Task<Tenant?> ResolverPorToken(HttpContext http, ITenantServices resolver)
        {
            var claim = http.User!.Claims.FirstOrDefault(c => c.Type == "TenantId")?.Value;
            if (!Guid.TryParse(claim, out var tenantId)) return null;
            return await resolver.BuscarTenantPorId(tenantId);
        }
    }
}
