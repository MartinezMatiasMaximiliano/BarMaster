using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Tenancy.Models;
using Humanizer;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Tenancy.Services
{
    public interface ITenantServices
    {
        Task<Tenant?> BuscarTenantPorHttpContext(HttpContext httpContext);
        Task<Tenant?> BuscarTenantPorNombreEmpresa(string nombreEmpresa);
        Task<Tenant> CrearTenant(Empresa request);
    }
    public class TenantServices : ITenantServices
    {
        
        private readonly MasterDbContext _masterDbContext;
        public TenantServices(MasterDbContext masterDbContext)
        {
            _masterDbContext = masterDbContext;
        }

        public async Task<Tenant?> BuscarTenantPorNombreEmpresa(string nombreEmpresa)
        {
            return await _masterDbContext.Tenants.FirstOrDefaultAsync(tenant => tenant.NombreEmpresa == nombreEmpresa.ToLower().Replace(" ",string.Empty));
        }

        public async Task<Tenant?> BuscarTenantPorHttpContext(HttpContext context)
        {
            if (!context.Request.Headers.TryGetValue("X-Tenant-ID", out var nombreEmpresa))
                return null;

            var tenant = await BuscarTenantPorNombreEmpresa(nombreEmpresa!);

            if (tenant is null)
                return null;

            return tenant;

        }

        public async Task<Tenant> CrearTenant(Empresa request)
        {
                var tenant = new Tenant
                {
                    NombreEmpresa = request.Nombre.ToLower().Replace(" ",string.Empty),
                    FechaCreacion = request.FechaInscripcion,
                };

                tenant.NombreDB = $"{tenant.Id.ToString().Split("-")[0]}_DB";
                tenant.ConnectionString = $"Host=localhost; Database={tenant.NombreDB}; Username=postgres; Password=123456";
             

                var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>()
                .UseNpgsql(tenant.ConnectionString);

                using (var dbContext = new AppDbContext(optionsBuilder.Options))
                {
                    await dbContext.Database.MigrateAsync();
                    await dbContext.Empresas.AddAsync(request);
                    await dbContext.SaveChangesAsync();

                }
                await _masterDbContext.Tenants.AddAsync(tenant);
                await _masterDbContext.SaveChangesAsync();
                return tenant;
        }
    }
}
