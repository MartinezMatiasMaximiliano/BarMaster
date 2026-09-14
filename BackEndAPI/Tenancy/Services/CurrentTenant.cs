using BackEndAPI.Tenancy.Models;

namespace BackEndAPI.Tenancy.Services
{
    public interface ICurrentTenant
    {
        Tenant? Tenant { get; }
    }

    public class CurrentTenant : ICurrentTenant
    {
        private readonly IHttpContextAccessor _http;

        public CurrentTenant(IHttpContextAccessor http)
        {
            _http = http;
        }

        public Tenant? Tenant => _http.HttpContext?.Items["Tenant"] as Tenant;
    }
}
