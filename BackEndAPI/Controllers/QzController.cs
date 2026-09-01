using BackEndAPI.Printing.Qz;
using BackEndAPI.Printing.Stations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace BackEndAPI.Controllers;

[ApiController]
[Route("api/qz")]
public sealed class QzController : ControllerBase
{
    private readonly IQzSigningService signingService;
    private readonly IPrintingStationService stationService;
    private readonly QzSigningOptions options;
    private readonly IWebHostEnvironment environment;

    public QzController(
        IQzSigningService signingService,
        IPrintingStationService stationService,
        IOptions<QzSigningOptions> options,
        IWebHostEnvironment environment)
    {
        this.signingService = signingService;
        this.stationService = stationService;
        this.options = options.Value;
        this.environment = environment;
    }

    [AllowAnonymous]
    [HttpGet("certificate")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult Certificate()
    {
        if (!signingService.State.Ready)
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "QZ_SIGNING_DISABLED");
        return Content(signingService.GetPublicCertificatePem(), "text/plain; charset=utf-8");
    }

    [Authorize(Policy = "Printing.Use")]
    [EnableRateLimiting("QzSigning")]
    [HttpPost("sign")]
    [RequestSizeLimit(4096)]
    public async Task<IActionResult> Sign(QzSignRequest request, CancellationToken cancellationToken)
    {
        if (!signingService.State.Ready)
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "QZ_SIGNING_DISABLED");

        var stationHeader = Request.Headers["X-Printing-Station-ID"].ToString();
        if (!Guid.TryParse(stationHeader, out var headerStationId) || headerStationId != request.StationId)
            return BadRequest(new { error = new { code = "STATION_HEADER_MISMATCH", message = "La estación del header y del body no coinciden." } });

        var allowDevelopmentPoc = environment.IsDevelopment() && options.AllowUnregisteredStationsInDevelopment;
        if (!allowDevelopmentPoc && !await stationService.CanUseAsync(request.StationId, cancellationToken))
            return StatusCode(StatusCodes.Status403Forbidden, new { error = new { code = "STATION_NOT_AUTHORIZED", message = "La estación no está autorizada." } });

        try
        {
            return Content(signingService.SignDigest(request.Request), "text/plain; charset=utf-8");
        }
        catch (ArgumentException)
        {
            return BadRequest(new { error = new { code = "INVALID_QZ_DIGEST", message = "El digest QZ es inválido." } });
        }
    }

    [AllowAnonymous]
    [HttpGet("health")]
    public IActionResult Health() => Ok(new
    {
        enabled = signingService.State.Enabled,
        ready = signingService.State.Ready
    });

    [Authorize(Policy = "Printing.Diagnostics")]
    [HttpGet("health/details")]
    public IActionResult HealthDetails()
    {
        var state = signingService.State;
        return Ok(new
        {
            state.Enabled,
            state.Ready,
            state.Degraded,
            state.NotBeforeUtc,
            state.NotAfterUtc,
            state.RemainingDays,
            certificateSha256 = Abbreviate(state.CertificateSha256),
            rootCertificateSha256 = Abbreviate(state.RootCertificateSha256)
        });
    }

    private static string? Abbreviate(string? value) => value is null ? null : $"{value[..12]}…{value[^12..]}";
}
