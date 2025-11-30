using BackEndAPI.Tenancy;
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

        public async Task<ApiDbContext> CreateAsync(HttpContext http)
        {
            var resolver = _services.GetRequiredService<ITenantResolver>();
            var tenant = await resolver.ResolveTenantAsync(http)
                        ?? throw new Exception("Tenant could not be resolved");

            var optionsBuilder = new DbContextOptionsBuilder<ApiDbContext>();
            optionsBuilder.UseNpgsql(tenant.ConnectionString);

            return new ApiDbContext(optionsBuilder.Options, tenant);
        }
    }
}
