using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Tenancy.Models;
using Microsoft.EntityFrameworkCore;
using System.Xml.Linq;

namespace BackEndAPI.Tenancy.Services
{
    public interface ITenantProvisioner
    {
        Task<Tenant> ProvisionTenantAsync(Empresa nombreEmpresa);
    }
    public class TenantProvisioner : ITenantProvisioner
    {
        private readonly MasterDbContext _tenantDbContext;
        public TenantProvisioner(MasterDbContext tenancyDbContext)
        {
            _tenantDbContext = tenancyDbContext;
        }

        public async Task<Tenant> ProvisionTenantAsync(Empresa empresa)
        {
            try
            {
                var nombreDB = $"{empresa.Nombre}DB";
                var connectionString = $"Host=localhost; Database={nombreDB}; Username=postgres; Password=123456";

                var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>()
                .UseNpgsql(connectionString);

                using (var dbContext = new AppDbContext(optionsBuilder.Options))
                {
                    await dbContext.Database.MigrateAsync();

                    await dbContext.Empresas.AddAsync(empresa);
                    await dbContext.SaveChangesAsync();

                }

                var tenant = new Tenant
                {
                    NombreEmpresa = empresa.Nombre,
                    NombreDB = nombreDB,
                    ConnectionString = connectionString,
                    FechaCreacion = empresa.FechaInscripcion,
                };

                await _tenantDbContext.Tenants.AddAsync(tenant);
                await _tenantDbContext.SaveChangesAsync();
                return tenant;

            }
            catch (Exception ex)
            {
                var me = ex.Message;
                return null;
            }

        }
    }
}
