using BackEndAPI.Data;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Tenancy.Services
{
    public class TenantDbMiddleware
    {
        private readonly RequestDelegate _next;
        public TenantDbMiddleware(RequestDelegate next)
        {
            _next = next;
        }
        public async Task InvokeAsync(HttpContext context, AppDbContextFactory factory)
        {

            using var dbContext = await factory.CreateAsync(context);

            if (dbContext != null)
            {
                context.RequestServices
                .GetRequiredService<IHttpContextAccessor>()
                .HttpContext!
                .Items["DbContext"] = dbContext;
            }

            await _next(context);
        }
    }
}
