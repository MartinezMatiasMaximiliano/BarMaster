using BackEndAPI.Tenancy.Models;

namespace BackEndAPI.Tenancy.Services
{
    public interface ITenantResolver
    {
        Task<Tenant?> ResolveTenantAsync(HttpContext httpContext);
    }   
    public class TenantResolver : ITenantResolver
    {
        private readonly ITenantProvider _tenantProvider;
        public TenantResolver(ITenantProvider tenantProvider)
        {
            _tenantProvider = tenantProvider;
        }

        public async Task<Tenant?> ResolveTenantAsync(HttpContext context)
        {
            if (!context.Request.Headers.TryGetValue("X-Tenant-ID", out var NombreEmpresa))
                return await Task.FromResult<Tenant?>(null);
            
            var tenant = await _tenantProvider.GetTenant(NombreEmpresa!);

            if (tenant is null)
                return await  Task.FromResult<Tenant?>(null);

            return await Task.FromResult<Tenant?>(tenant);
           
        }
    }
}
