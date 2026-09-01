using BackEndAPI.Models.Printing;
using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.Printing.Stations;

public sealed record RegisterPrintingStationRequest(
    Guid ClientInstallationId,
    [param: Required, StringLength(120, MinimumLength = 2)] string Name);

public sealed record UpdatePrinterAssignmentRequest(
    [param: Required, StringLength(260, MinimumLength = 1)] string QzPrinterName,
    PrintFormat Format,
    [param: Range(58, 80)] short PaperWidthMm,
    [param: Range(1, 10)] short Copies,
    bool Enabled);

public sealed record SetPrintingStationEnabledRequest(bool Enabled);

public sealed record PrintingStationResponse(
    Guid Id,
    Guid ClientInstallationId,
    string Name,
    bool Enabled,
    DateTime CreatedAt,
    DateTime? LastSeenAt,
    DateTime? RevokedAt);

public sealed record PrinterAssignmentResponse(
    Guid Id,
    Guid StationId,
    PrinterRole Role,
    string QzPrinterName,
    PrintFormat Format,
    short PaperWidthMm,
    short Copies,
    bool Enabled,
    DateTime UpdatedAt);
