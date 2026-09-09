using BackEndAPI.DTOs.Response;
using System.Text.Json;

namespace BackEndAPI.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                var tenantId = context.Items.TryGetValue("TenantId", out var t) ? t : null;
                var tenantNombre = context.Items.TryGetValue("TenantNombre", out var tn) ? tn : null;
                var userId = ObtenerIdUsuario(context);
                var tipoAuth = context.User?.Claims.FirstOrDefault(c => c.Type == "TipoAuth")?.Value;

                _logger.LogError(
                    ex,
                    "Excepción no controlada. Método={Metodo} Path={Path} TenantId={TenantId} TenantNombre={TenantNombre} UserId={UserId} TipoAuth={TipoAuth}",
                    context.Request.Method,
                    context.Request.Path.Value,
                    tenantId,
                    tenantNombre,
                    userId,
                    tipoAuth);

                if (context.Response.HasStarted)
                {
                    // La respuesta ya empezó a escribirse (ej. streaming), no se puede sobreescribir el status code.
                    throw;
                }

                context.Response.Clear();
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;

                var body = new ErrorDTO(500, "INTERNAL SERVER ERROR", "Ocurrió un error inesperado");
                await context.Response.WriteAsync(JsonSerializer.Serialize(body));
            }
        }

        private static string? ObtenerIdUsuario(HttpContext context)
        {
            if (context.User?.Identity?.IsAuthenticated != true) return null;

            return context.User.Claims.FirstOrDefault(c =>
                c.Type is "IdPersona" or "IdSucursal" or "IdEmpresa")?.Value;
        }
    }
}
