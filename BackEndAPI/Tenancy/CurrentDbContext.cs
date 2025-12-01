using BackEndAPI.Data;
using System;

namespace BackEndAPI.Tenancy
{

    public interface ICurrentDbContext
    {
        ApiDbContext Db { get; }
    }
    public class CurrentDbContext : ICurrentDbContext
    {
        private readonly IHttpContextAccessor _http;

        public CurrentDbContext(IHttpContextAccessor http)
        {
            _http = http;
        }

        public ApiDbContext Db =>
            (ApiDbContext)_http.HttpContext!.Items["DbContext"]!;
    }
}
