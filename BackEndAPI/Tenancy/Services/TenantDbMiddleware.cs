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
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var tenantClaim = context.User.FindFirst("TenantId")?.Value;
                var tenantHeader = context.Request.Headers["X-Tenant-ID"].ToString();
                if (string.IsNullOrWhiteSpace(tenantClaim)
                    || string.IsNullOrWhiteSpace(tenantHeader)
                    || !string.Equals(
                        TenantIdentifier.Normalize(tenantClaim),
                        TenantIdentifier.Normalize(tenantHeader),
                        StringComparison.Ordinal))
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        error = new { code = "TENANT_MISMATCH", message = "El tenant autenticado no coincide con la solicitud." }
                    });
                    return;
                }
            }

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
