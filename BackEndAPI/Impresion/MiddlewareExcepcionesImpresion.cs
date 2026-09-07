using BackEndAPI.Impresion.Estaciones;

namespace BackEndAPI.Impresion;

public sealed class MiddlewareExcepcionesImpresion
{
    private readonly RequestDelegate siguiente;
    private readonly ILogger<MiddlewareExcepcionesImpresion> registrador;

    public MiddlewareExcepcionesImpresion(RequestDelegate siguiente, ILogger<MiddlewareExcepcionesImpresion> registrador)
    {
        this.siguiente = siguiente;
        this.registrador = registrador;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await siguiente(context);
        }
        catch (ExcepcionEstacionImpresion exception)
        {
            context.Response.StatusCode = exception.CodigoEstado;
            await context.Response.WriteAsJsonAsync(new { error = new { codigo = exception.Codigo, mensaje = exception.Message } });
        }
        catch (InvalidOperationException exception) when (exception.Message == "FIRMA_QZ_DESHABILITADA")
        {
            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            await context.Response.WriteAsJsonAsync(new { error = new { codigo = "FIRMA_QZ_DESHABILITADA", mensaje = "El firmador QZ está deshabilitado." } });
        }
        catch (Exception exception) when (context.Request.Path.StartsWithSegments("/api/qz") || context.Request.Path.StartsWithSegments("/api/impresion"))
        {
            registrador.LogError(exception, "Error no controlado en la integración de impresión.");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new { error = new { codigo = "ERROR_INTERNO_IMPRESION", mensaje = "Error interno de impresión." } });
        }
    }
}
