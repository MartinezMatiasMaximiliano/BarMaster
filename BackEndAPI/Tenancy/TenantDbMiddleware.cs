using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Tenancy
{
    public class TenantDbMiddleware
    {
        private readonly RequestDelegate _next;
        public TenantDbMiddleware(RequestDelegate next)
        {
            _next = next;
        }
        public async Task InvokeAsync(HttpContext context, Data.AppDbContextFactory dbContextFactory)
        {
            using var dbContext = await dbContextFactory.CreateAsync(context);
            context.RequestServices
            .GetRequiredService<IHttpContextAccessor>()
            .HttpContext!
            .Items["DbContext"] = dbContext;

            await _next(context);
        }
    }
}
