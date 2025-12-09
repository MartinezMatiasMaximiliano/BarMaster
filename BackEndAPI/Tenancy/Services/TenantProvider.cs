using BackEndAPI.Data;
using BackEndAPI.Tenancy.Models;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Tenancy.Services
{
    public interface ITenantProvider
    {
        Task<Tenant?> GetTenant(string tenantId);
    }

    public class TenantProvider : ITenantProvider
    {
        private readonly MasterDbContext _tenantDB;

        public TenantProvider(MasterDbContext TenantDB)
        {
            _tenantDB = TenantDB;
        }

        public async Task<Tenant?> GetTenant(string NombreEmpresa)
        {
            var tenant = await _tenantDB.Tenants.FirstOrDefaultAsync(tenant => tenant.NombreEmpresa == NombreEmpresa);
            return tenant;
        }

    }
}
