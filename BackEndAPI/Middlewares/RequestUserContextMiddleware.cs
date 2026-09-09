using Serilog;

namespace BackEndAPI.Middlewares
{
    /// <summary>
    /// Agrega quién hizo el request (tipo de token y su id) a la línea de resumen que
    /// genera UseSerilogRequestLogging. Se registra después de UseAuthorization porque
    /// recién ahí HttpContext.User tiene los claims del JWT ya validados.
    /// </summary>
    public class RequestUserContextMiddleware
    {
        private readonly RequestDelegate _next;

        public RequestUserContextMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IDiagnosticContext diagnosticContext)
        {
            if (context.User?.Identity?.IsAuthenticated == true)
            {
                var tipoAuth = context.User.Claims.FirstOrDefault(c => c.Type == "TipoAuth")?.Value;
                var userId = context.User.Claims.FirstOrDefault(c =>
                    c.Type is "IdPersona" or "IdSucursal" or "IdEmpresa")?.Value;

                diagnosticContext.Set("TipoAuth", tipoAuth);
                diagnosticContext.Set("UserId", userId);
            }

            await _next(context);
        }
    }
}
