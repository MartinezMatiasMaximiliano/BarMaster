using BackEndAPI.DTOs.Response;
using BackEndAPI.Exceptions;
using System.Runtime.ExceptionServices;
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
            catch (AppException ex)
            {
                // Excepción de negocio esperada (no encontrado, conflicto, regla violada):
                // se loguea como Warning -no ensucia el nivel Error con cosas normales del
                // negocio- y se responde con el status/tipo que la propia excepción declara.
                await LogYResponderAsync(context, ex, ex.StatusCode, ex.Tipo, ex.Message, esperada: true);
            }
            catch (Exception ex)
            {
                // No es una excepción de negocio contemplada: puede ser un bug real.
                // Se loguea completa (con stack trace) y se responde 500 genérico.
                await LogYResponderAsync(context, ex, StatusCodes.Status500InternalServerError, "INTERNAL SERVER ERROR", "Ocurrió un error inesperado", esperada: false);
            }
        }

        private async Task LogYResponderAsync(HttpContext context, Exception ex, int statusCode, string tipo, string mensajeCliente, bool esperada)
        {
            var tenantId = context.Items.TryGetValue("TenantId", out var t) ? t : null;
            var tenantNombre = context.Items.TryGetValue("TenantNombre", out var tn) ? tn : null;
            var userId = ObtenerIdUsuario(context);
            var tipoAuth = context.User?.Claims.FirstOrDefault(c => c.Type == "TipoAuth")?.Value;

            if (esperada)
            {
                _logger.LogWarning(
                    "{Tipo} ({StatusCode}): {Mensaje}. Método={Metodo} Path={Path} TenantId={TenantId} TenantNombre={TenantNombre} UserId={UserId} TipoAuth={TipoAuth}",
                    tipo, statusCode, ex.Message, context.Request.Method, context.Request.Path.Value, tenantId, tenantNombre, userId, tipoAuth);
            }
            else
            {
                _logger.LogError(
                    ex,
                    "Excepción no controlada. Método={Metodo} Path={Path} TenantId={TenantId} TenantNombre={TenantNombre} UserId={UserId} TipoAuth={TipoAuth}",
                    context.Request.Method, context.Request.Path.Value, tenantId, tenantNombre, userId, tipoAuth);
            }

            if (context.Response.HasStarted)
            {
                // La respuesta ya empezó a escribirse (ej. streaming), no se puede sobreescribir
                // el status code. Se relanza preservando el stack trace original.
                ExceptionDispatchInfo.Capture(ex).Throw();
                return; // inalcanzable, Throw() siempre lanza; deja conforme al compilador
            }

            context.Response.Clear();
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var body = new ErrorDTO(statusCode, tipo, mensajeCliente);
            await context.Response.WriteAsync(JsonSerializer.Serialize(body));
        }

        private static string? ObtenerIdUsuario(HttpContext context)
        {
            if (context.User?.Identity?.IsAuthenticated != true) return null;

            return context.User.Claims.FirstOrDefault(c =>
                c.Type is "IdPersona" or "IdSucursal" or "IdEmpresa")?.Value;
        }
    }
}
