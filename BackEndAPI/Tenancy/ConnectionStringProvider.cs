namespace BackEndAPI.Tenancy
{
    public interface IConnectionStringProvider
    {
        string? GetConnectionString(string tenantId);
    }

    public class ConnectionStringProvider : IConnectionStringProvider
    {
        private readonly IConfiguration _config;
        public ConnectionStringProvider(IConfiguration config)
        {
            _config = config;
        }

        public string? GetConnectionString(string tenantId)
        {
            return _config.GetSection("TenantDatabases")[tenantId];
        }

    }
}
