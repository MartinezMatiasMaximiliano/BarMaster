using BackEndAPI.Data;
using BackEndAPI.Tenancy.Models;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Tenancy.Services
{
    public interface ITenantServices
    {
        Task<Tenant?> GetTenant(string tenantId);
        Task<Tenant?> BuscarTenantPorId(HttpContext httpContext);
    }
    public class TenantServices : ITenantServices
    {
        
        private readonly MasterDbContext _tenantDB;
        public TenantServices(MasterDbContext TenantDB)
        {
            _tenantDB = TenantDB;
        }
        public async Task<Tenant?> GetTenant(string NombreEmpresa)
        {
            var tenant = await _tenantDB.Tenants.FirstOrDefaultAsync(tenant => tenant.NombreEmpresa == NombreEmpresa);
            return tenant;
        }

        public async Task<Tenant?> BuscarTenantPorId(HttpContext context)
        {
            if (!context.Request.Headers.TryGetValue("X-Tenant-ID", out var NombreEmpresa))
                return null;

            var tenant = await GetTenant(NombreEmpresa!);

            if (tenant is null)
                return null;

            return tenant;

        }

    }
}
