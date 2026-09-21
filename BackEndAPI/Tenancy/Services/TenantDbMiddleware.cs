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
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var tenantClaim = context.User.FindFirst("TenantId")?.Value;
                var tenantHeader = context.Request.Headers["X-Tenant-ID"].ToString();

                // Los navegadores no permiten agregar encabezados personalizados al upgrade
                // WebSocket. Para el hub de impresión, la estación ya está autenticada con un
                // JWT propio, por lo que usamos su TenantId firmado como encabezado interno.
                var esHubEstacionImpresion = context.Request.Path.StartsWithSegments("/hubs/impresion")
                    && context.User.HasClaim("TipoAuth", "estacion_impresion");
                if (esHubEstacionImpresion && string.IsNullOrWhiteSpace(tenantHeader)
                    && !string.IsNullOrWhiteSpace(tenantClaim))
                {
                    tenantHeader = TenantIdentifier.Normalize(tenantClaim);
                    context.Request.Headers["X-Tenant-ID"] = tenantHeader;
                }

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

                // Enriquece la línea de resumen de Serilog (UseSerilogRequestLogging) con el
                // tenant resuelto, para poder filtrar/agrupar logs por local sin abrir cada request.
                diagnosticContext.Set("TenantId", context.Items["TenantId"]);
                diagnosticContext.Set("TenantNombre", context.Items["TenantNombre"]);
            }

            await _next(context);
        }
    }
}
