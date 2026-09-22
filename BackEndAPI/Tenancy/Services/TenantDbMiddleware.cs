using BackEndAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace BackEndAPI.Tenancy.Services
{
    public class TenantDbMiddleware
    {
        private readonly RequestDelegate _next;
        public TenantDbMiddleware(RequestDelegate next)
        {
            _next = next;
        }
        public async Task InvokeAsync(HttpContext context, AppDbContextFactory factory, IDiagnosticContext diagnosticContext)
        {
            using var dbContext = await factory.CreateAsync(context);

            if (dbContext != null)
            {
                context.RequestServices
                .GetRequiredService<IHttpContextAccessor>()
                .HttpContext!
                .Items["DbContext"] = dbContext;

                // Enriquece la línea de resumen de Serilog (UseSerilogRequestLogging) con el
                // tenant resuelto, para poder filtrar/agrupar logs por local sin abrir cada request.
                diagnosticContext.Set("TenantId", context.Items["TenantId"]);
                diagnosticContext.Set("TenantNombre", context.Items["TenantNombre"]);
            }

            await _next(context);
        }
    }
}
