using BackEndAPI.Models.Printing;
using BackEndAPI.Printing.Identity;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Data;

namespace BackEndAPI.Printing.Stations;

public sealed class PrintingStationService : IPrintingStationService
{
    private readonly ICurrentDbContext currentDbContext;
    private readonly IPrintingRequestIdentity identity;
    private readonly TimeProvider timeProvider;

    public PrintingStationService(
        ICurrentDbContext currentDbContext,
        IPrintingRequestIdentity identity,
        TimeProvider timeProvider)
    {
        this.currentDbContext = currentDbContext;
        this.identity = identity;
        this.timeProvider = timeProvider;
    }

    public async Task<PrintingStationResponse> RegisterAsync(
        RegisterPrintingStationRequest request,
        CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();
        if (name.Length < 2)
            throw new PrintingStationException("INVALID_STATION_NAME", "El nombre de estación es inválido.", StatusCodes.Status400BadRequest);

        var db = currentDbContext.Db;
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);

        var station = await db.PrintingStations.SingleOrDefaultAsync(
            x => x.IdSucursal == identity.SucursalId && x.ClientInstallationId == request.ClientInstallationId,
            cancellationToken);

        var isNew = false;
        if (station is null)
        {
            isNew = true;
            station = new PrintingStation
            {
                Id = Guid.NewGuid(),
                IdSucursal = identity.SucursalId,
                ClientInstallationId = request.ClientInstallationId,
                Name = name,
                Enabled = true,
                CreatedAt = UtcNow,
                LastSeenAt = UtcNow
            };
            db.PrintingStations.Add(station);
        }
        else
        {
            station.Name = name;
            station.LastSeenAt = UtcNow;
        }

        try
        {
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (isNew && IsUniqueViolation(exception))
        {
            await transaction.RollbackAsync(cancellationToken);
            db.Entry(station).State = EntityState.Detached;
            station = await db.PrintingStations.SingleAsync(
                x => x.IdSucursal == identity.SucursalId && x.ClientInstallationId == request.ClientInstallationId,
                cancellationToken);
            station.Name = name;
            station.LastSeenAt = UtcNow;
            await db.SaveChangesAsync(cancellationToken);
        }
        return Map(station);
    }

    public async Task<PrintingStationResponse?> GetCurrentAsync(Guid clientInstallationId, CancellationToken cancellationToken)
    {
        var station = await currentDbContext.Db.PrintingStations.AsNoTracking().SingleOrDefaultAsync(
            x => x.IdSucursal == identity.SucursalId && x.ClientInstallationId == clientInstallationId,
            cancellationToken);
        return station is null ? null : Map(station);
    }

    public async Task<PrintingStationResponse> HeartbeatAsync(Guid stationId, CancellationToken cancellationToken)
    {
        var station = await GetOwnedStationAsync(stationId, cancellationToken);
        EnsureEnabled(station);
        station.LastSeenAt = UtcNow;
        await currentDbContext.Db.SaveChangesAsync(cancellationToken);
        return Map(station);
    }

    public async Task<IReadOnlyList<PrinterAssignmentResponse>> GetAssignmentsAsync(Guid stationId, CancellationToken cancellationToken)
    {
        var station = await GetOwnedStationAsync(stationId, cancellationToken);
        EnsureEnabled(station);
        return await currentDbContext.Db.PrinterAssignments.AsNoTracking()
            .Where(x => x.StationId == station.Id)
            .OrderBy(x => x.Role)
            .Select(x => Map(x))
            .ToListAsync(cancellationToken);
    }

    public async Task<PrinterAssignmentResponse> UpsertAssignmentAsync(
        Guid stationId,
        PrinterRole role,
        UpdatePrinterAssignmentRequest request,
        CancellationToken cancellationToken)
    {
        if (!Enum.IsDefined(role) || !Enum.IsDefined(request.Format))
            throw new PrintingStationException("INVALID_PRINTING_OPTION", "Rol o formato de impresión inválido.", StatusCodes.Status400BadRequest);
        if (request.PaperWidthMm is not (58 or 80) || request.Copies is < 1 or > 10)
            throw new PrintingStationException("INVALID_PRINTING_OPTION", "Ancho o cantidad de copias inválido.", StatusCodes.Status400BadRequest);

        var printerName = request.QzPrinterName.Trim();
        if (printerName.Length == 0)
            throw new PrintingStationException("INVALID_PRINTER_NAME", "El nombre de impresora es obligatorio.", StatusCodes.Status400BadRequest);

        var station = await GetOwnedStationAsync(stationId, cancellationToken);
        EnsureEnabled(station);
        var db = currentDbContext.Db;
        var assignment = await db.PrinterAssignments.SingleOrDefaultAsync(
            x => x.StationId == station.Id && x.Role == role,
            cancellationToken);

        var isNew = false;
        if (assignment is null)
        {
            isNew = true;
            assignment = new PrinterAssignment { StationId = station.Id, Role = role };
            db.PrinterAssignments.Add(assignment);
        }

        ApplyAssignment(assignment, request, printerName);
        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (isNew && IsUniqueViolation(exception))
        {
            db.Entry(assignment).State = EntityState.Detached;
            assignment = await db.PrinterAssignments.SingleAsync(
                x => x.StationId == station.Id && x.Role == role,
                cancellationToken);
            ApplyAssignment(assignment, request, printerName);
            await db.SaveChangesAsync(cancellationToken);
        }
        return Map(assignment);
    }

    public async Task<PrintingStationResponse> SetEnabledAsync(Guid stationId, bool enabled, CancellationToken cancellationToken)
    {
        var station = await GetOwnedStationAsync(stationId, cancellationToken);
        station.Enabled = enabled;
        station.RevokedAt = enabled ? null : UtcNow;
        await currentDbContext.Db.SaveChangesAsync(cancellationToken);
        return Map(station);
    }

    public async Task<bool> CanUseAsync(Guid stationId, CancellationToken cancellationToken) =>
        await currentDbContext.Db.PrintingStations.AsNoTracking().AnyAsync(
            x => x.Id == stationId && x.IdSucursal == identity.SucursalId && x.Enabled && x.RevokedAt == null,
            cancellationToken);

    private async Task<PrintingStation> GetOwnedStationAsync(Guid stationId, CancellationToken cancellationToken) =>
        await currentDbContext.Db.PrintingStations.SingleOrDefaultAsync(
            x => x.Id == stationId && x.IdSucursal == identity.SucursalId,
            cancellationToken)
        ?? throw new PrintingStationException("STATION_NOT_FOUND", "La estación no existe en esta sucursal.", StatusCodes.Status404NotFound);

    private static void EnsureEnabled(PrintingStation station)
    {
        if (!station.Enabled || station.RevokedAt is not null)
            throw new PrintingStationException("STATION_DISABLED", "La estación está deshabilitada.", StatusCodes.Status403Forbidden);
    }

    private DateTime UtcNow => timeProvider.GetUtcNow().UtcDateTime;

    private void ApplyAssignment(PrinterAssignment assignment, UpdatePrinterAssignmentRequest request, string printerName)
    {
        assignment.QzPrinterName = printerName;
        assignment.Format = request.Format;
        assignment.PaperWidthMm = request.PaperWidthMm;
        assignment.Copies = request.Copies;
        assignment.Enabled = request.Enabled;
        assignment.UpdatedAt = UtcNow;
    }

    private static bool IsUniqueViolation(DbUpdateException exception) =>
        exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation };

    private static PrintingStationResponse Map(PrintingStation station) => new(
        station.Id, station.ClientInstallationId, station.Name, station.Enabled,
        station.CreatedAt, station.LastSeenAt, station.RevokedAt);

    private static PrinterAssignmentResponse Map(PrinterAssignment assignment) => new(
        assignment.Id, assignment.StationId, assignment.Role, assignment.QzPrinterName,
        assignment.Format, assignment.PaperWidthMm, assignment.Copies, assignment.Enabled,
        assignment.UpdatedAt);
}
