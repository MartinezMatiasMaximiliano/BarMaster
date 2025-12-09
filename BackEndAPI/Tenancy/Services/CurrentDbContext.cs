using BackEndAPI.Data;
using System;

namespace BackEndAPI.Tenancy.Services
{
    public interface ICurrentDbContext
    {
        AppDbContext Db { get; }
    }

    public class CurrentDbContext : ICurrentDbContext
    {
        private readonly IHttpContextAccessor _http;

        public CurrentDbContext(IHttpContextAccessor http)
        {
            _http = http;
        }

        public AppDbContext Db => (AppDbContext)_http.HttpContext!.Items["DbContext"]!;

    }
}
