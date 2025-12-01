namespace BackEndAPI.Tenancy
{
    public interface ITenantResolver
    {
        Task<TenantInfo?> ResolveTenantAsync(HttpContext httpContext);
    }   
    public class TenantResolverHeader : ITenantResolver
    {
        private readonly IConnectionStringProvider _connectionStrings;

        public TenantResolverHeader(IConnectionStringProvider connectionStrings)
        {
            _connectionStrings = connectionStrings;
        }

        public Task<TenantInfo?> ResolveTenantAsync(HttpContext context)
        {
            if (!context.Request.Headers.TryGetValue("X-Tenant-ID", out var tenantId))
                return Task.FromResult<TenantInfo?>(null);

            var conn = _connectionStrings.GetConnectionString(tenantId!);

            if (conn is null)
                return Task.FromResult<TenantInfo?>(null);

            return Task.FromResult<TenantInfo?>(new TenantInfo
            {
                TenantId = tenantId!,
                ConnectionString = conn
            });
        }
    }
}
