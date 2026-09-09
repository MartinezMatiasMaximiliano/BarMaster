using BackEndAPI.Tenancy.Models;
using BackEndAPI.Tenancy.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

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

        public async Task<AppDbContext> CreateAsync(HttpContext http)
        {

            var resolver = _services.GetRequiredService<ITenantServices>();
            var tenant = await resolver.BuscarTenantPorHttpContext(http);

            if (tenant == null)
            {
                _logger.LogWarning(
                    "No se pudo resolver el tenant para {Metodo} {Path}. Header X-Tenant-ID={TenantHeader}",
                    http.Request.Method,
                    http.Request.Path.Value,
                    http.Request.Headers.TryGetValue("X-Tenant-ID", out var header) ? header.ToString() : "(ausente)");
                return null;
            }

            http.Items["TenantId"] = tenant.Id;
            http.Items["TenantNombre"] = tenant.NombreEmpresa;

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseNpgsql(tenant.ConnectionString);

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}
