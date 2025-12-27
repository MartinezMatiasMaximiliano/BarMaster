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

        public AppDbContextFactory(IServiceProvider services)
        {
            _services = services;
        }

        public async Task<AppDbContext> CreateAsync(HttpContext http)
        {

            var resolver = _services.GetRequiredService<ITenantServices>();
            var tenant = await resolver.BuscarTenantPorHttpContext(http);

            if (tenant == null)
            {
                return null;
            }

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseNpgsql(tenant.ConnectionString);

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}
