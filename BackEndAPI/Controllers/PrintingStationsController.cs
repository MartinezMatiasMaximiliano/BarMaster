using BackEndAPI.Models.Printing;
using BackEndAPI.Printing.Stations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers;

[ApiController]
[Route("api/printing/stations")]
public sealed class PrintingStationsController : ControllerBase
{
    private readonly IPrintingStationService stationService;

    public PrintingStationsController(IPrintingStationService stationService)
    {
        this.stationService = stationService;
    }

    [Authorize(Policy = "Printing.Use")]
    [HttpPost("register")]
    public async Task<ActionResult<PrintingStationResponse>> Register(
        RegisterPrintingStationRequest request,
        CancellationToken cancellationToken) =>
        Ok(await stationService.RegisterAsync(request, cancellationToken));

    [Authorize(Policy = "Printing.Use")]
    [HttpGet("current")]
    public async Task<ActionResult<PrintingStationResponse>> Current(
        [FromQuery] Guid clientInstallationId,
        CancellationToken cancellationToken)
    {
        var station = await stationService.GetCurrentAsync(clientInstallationId, cancellationToken);
        return station is null ? NotFound() : Ok(station);
    }

    [Authorize(Policy = "Printing.Use")]
    [HttpPost("{stationId:guid}/heartbeat")]
    public async Task<ActionResult<PrintingStationResponse>> Heartbeat(Guid stationId, CancellationToken cancellationToken) =>
        Ok(await stationService.HeartbeatAsync(stationId, cancellationToken));

    [Authorize(Policy = "Printing.Use")]
    [HttpGet("{stationId:guid}/assignments")]
    public async Task<ActionResult<IReadOnlyList<PrinterAssignmentResponse>>> Assignments(
        Guid stationId,
        CancellationToken cancellationToken) =>
        Ok(await stationService.GetAssignmentsAsync(stationId, cancellationToken));

    [Authorize(Policy = "Printing.Configure")]
    [HttpPut("{stationId:guid}/assignments/{role}")]
    public async Task<ActionResult<PrinterAssignmentResponse>> UpsertAssignment(
        Guid stationId,
        PrinterRole role,
        UpdatePrinterAssignmentRequest request,
        CancellationToken cancellationToken) =>
        Ok(await stationService.UpsertAssignmentAsync(stationId, role, request, cancellationToken));

    [Authorize(Policy = "Printing.Configure")]
    [HttpPatch("{stationId:guid}/enabled")]
    public async Task<ActionResult<PrintingStationResponse>> SetEnabled(
        Guid stationId,
        SetPrintingStationEnabledRequest request,
        CancellationToken cancellationToken) =>
        Ok(await stationService.SetEnabledAsync(stationId, request.Enabled, cancellationToken));
}
