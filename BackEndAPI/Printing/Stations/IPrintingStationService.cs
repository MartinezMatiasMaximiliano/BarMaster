using BackEndAPI.Models.Printing;

namespace BackEndAPI.Printing.Stations;

public interface IPrintingStationService
{
    Task<PrintingStationResponse> RegisterAsync(RegisterPrintingStationRequest request, CancellationToken cancellationToken);
    Task<PrintingStationResponse?> GetCurrentAsync(Guid clientInstallationId, CancellationToken cancellationToken);
    Task<PrintingStationResponse> HeartbeatAsync(Guid stationId, CancellationToken cancellationToken);
    Task<IReadOnlyList<PrinterAssignmentResponse>> GetAssignmentsAsync(Guid stationId, CancellationToken cancellationToken);
    Task<PrinterAssignmentResponse> UpsertAssignmentAsync(Guid stationId, PrinterRole role, UpdatePrinterAssignmentRequest request, CancellationToken cancellationToken);
    Task<PrintingStationResponse> SetEnabledAsync(Guid stationId, bool enabled, CancellationToken cancellationToken);
    Task<bool> CanUseAsync(Guid stationId, CancellationToken cancellationToken);
}
