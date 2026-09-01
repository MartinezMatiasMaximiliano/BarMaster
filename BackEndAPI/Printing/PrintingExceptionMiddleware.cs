using BackEndAPI.Printing.Stations;

namespace BackEndAPI.Printing;

public sealed class PrintingExceptionMiddleware
{
    private readonly RequestDelegate next;
    private readonly ILogger<PrintingExceptionMiddleware> logger;

    public PrintingExceptionMiddleware(RequestDelegate next, ILogger<PrintingExceptionMiddleware> logger)
    {
        this.next = next;
        this.logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (PrintingStationException exception)
        {
            context.Response.StatusCode = exception.StatusCode;
            await context.Response.WriteAsJsonAsync(new { error = new { code = exception.Code, message = exception.Message } });
        }
        catch (InvalidOperationException exception) when (exception.Message == "QZ_SIGNING_DISABLED")
        {
            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            await context.Response.WriteAsJsonAsync(new { error = new { code = "QZ_SIGNING_DISABLED", message = "El firmador QZ está deshabilitado." } });
        }
        catch (Exception exception) when (context.Request.Path.StartsWithSegments("/api/qz") || context.Request.Path.StartsWithSegments("/api/printing"))
        {
            logger.LogError(exception, "Error no controlado en la integración de impresión.");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new { error = new { code = "PRINTING_INTERNAL_ERROR", message = "Error interno de impresión." } });
        }
    }
}
