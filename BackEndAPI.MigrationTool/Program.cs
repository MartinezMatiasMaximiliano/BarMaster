using BackEndAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Npgsql;
using System.Diagnostics;
using System.Text.Json;

var arguments = MigrationArguments.Parse(args);
var repositoryRoot = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".."));
var backendDirectory = Path.Combine(repositoryRoot, "BackEndAPI");
var configuration = new ConfigurationBuilder()
    .SetBasePath(backendDirectory)
    .AddJsonFile("appsettings.json", optional: false)
    .AddEnvironmentVariables()
    .Build();

var masterConnection = configuration.GetConnectionString("Master")
    ?? throw new InvalidOperationException("No se configuró ConnectionStrings:Master.");
var masterOptions = new DbContextOptionsBuilder<MasterDbContext>().UseNpgsql(masterConnection).Options;
await using var masterDb = new MasterDbContext(masterOptions);
var tenantQuery = masterDb.Tenants.AsNoTracking();
if (!string.IsNullOrWhiteSpace(arguments.Tenant))
    tenantQuery = tenantQuery.Where(x => x.NombreEmpresa == arguments.Tenant);
var tenants = await tenantQuery.OrderBy(x => x.NombreEmpresa).ToListAsync();

if (tenants.Count == 0) throw new InvalidOperationException("No se encontraron tenants para procesar.");
if (arguments.Apply)
{
    if (string.IsNullOrWhiteSpace(arguments.PgDumpPath) || !File.Exists(arguments.PgDumpPath))
        throw new InvalidOperationException("--pg-dump debe apuntar a pg_dump.exe antes de aplicar migraciones.");
    if (string.IsNullOrWhiteSpace(arguments.BackupDirectory))
        throw new InvalidOperationException("--backup-directory es obligatorio al aplicar migraciones.");
    Directory.CreateDirectory(arguments.BackupDirectory);
}

var logPath = arguments.LogPath ?? Path.Combine(repositoryRoot, $"tenant-migration-{DateTime.UtcNow:yyyyMMdd-HHmmss}.jsonl");
var logDirectory = Path.GetDirectoryName(Path.GetFullPath(logPath));
if (!string.IsNullOrWhiteSpace(logDirectory)) Directory.CreateDirectory(logDirectory);
foreach (var tenant in tenants)
{
    var tenantOptions = new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(tenant.ConnectionString).Options;
    await using var tenantDb = new AppDbContext(tenantOptions);
    var pending = (await tenantDb.Database.GetPendingMigrationsAsync()).ToArray();
    var entry = new MigrationLogEntry(tenant.Id, tenant.NombreEmpresa, pending, arguments.Apply, "Inspected", null, DateTime.UtcNow);
    try
    {
        Console.WriteLine($"{tenant.NombreEmpresa}: {pending.Length} migraciones pendientes.");
        if (arguments.Apply && pending.Length > 0)
        {
            var safeTenantName = SanitizeFileName(tenant.NombreEmpresa);
            var backupPath = Path.Combine(arguments.BackupDirectory!, $"{safeTenantName}-{tenant.Id:N}-{DateTime.UtcNow:yyyyMMdd-HHmmss}.dump");
            await BackupAsync(arguments.PgDumpPath!, tenant.ConnectionString, backupPath);
            await tenantDb.Database.MigrateAsync();
            entry = entry with { Status = "Migrated", BackupPath = backupPath };
        }
        else entry = entry with { Status = pending.Length == 0 ? "UpToDate" : "DryRun" };
    }
    catch (Exception exception)
    {
        entry = entry with { Status = "Failed", Error = exception.Message };
        await AppendLogAsync(logPath, entry);
        throw;
    }
    await AppendLogAsync(logPath, entry);
}
Console.WriteLine($"Log: {logPath}");

static async Task BackupAsync(string pgDumpPath, string connectionString, string destination)
{
    var connection = new NpgsqlConnectionStringBuilder(connectionString);
    var host = connection.Host ?? throw new InvalidOperationException("La conexión del tenant no define Host.");
    var database = connection.Database ?? throw new InvalidOperationException("La conexión del tenant no define Database.");
    var username = connection.Username ?? throw new InvalidOperationException("La conexión del tenant no define Username.");
    var startInfo = new ProcessStartInfo(pgDumpPath) { UseShellExecute = false, RedirectStandardError = true, CreateNoWindow = true };
    foreach (var argument in new[] { "--host", host, "--port", connection.Port.ToString(), "--username", username, "--dbname", database, "--format", "custom", "--file", destination })
        startInfo.ArgumentList.Add(argument);
    if (!string.IsNullOrEmpty(connection.Password))
        startInfo.Environment["PGPASSWORD"] = connection.Password;
    using var process = Process.Start(startInfo) ?? throw new InvalidOperationException("No se pudo iniciar pg_dump.");
    var error = await process.StandardError.ReadToEndAsync();
    await process.WaitForExitAsync();
    if (process.ExitCode != 0 || !File.Exists(destination) || new FileInfo(destination).Length == 0)
        throw new InvalidOperationException($"pg_dump falló con código {process.ExitCode}: {error}");

    var pgRestorePath = Path.Combine(Path.GetDirectoryName(Path.GetFullPath(pgDumpPath))!, "pg_restore.exe");
    if (!File.Exists(pgRestorePath))
        throw new InvalidOperationException("No se encontró pg_restore.exe junto a pg_dump.exe para validar el backup.");
    var validation = new ProcessStartInfo(pgRestorePath) { UseShellExecute = false, RedirectStandardError = true, CreateNoWindow = true };
    validation.ArgumentList.Add("--list");
    validation.ArgumentList.Add(destination);
    using var validationProcess = Process.Start(validation) ?? throw new InvalidOperationException("No se pudo iniciar pg_restore.");
    var validationError = await validationProcess.StandardError.ReadToEndAsync();
    await validationProcess.WaitForExitAsync();
    if (validationProcess.ExitCode != 0)
        throw new InvalidOperationException($"pg_restore no pudo validar el backup: {validationError}");
}

static Task AppendLogAsync(string logPath, MigrationLogEntry entry) =>
    File.AppendAllTextAsync(logPath, JsonSerializer.Serialize(entry) + Environment.NewLine);

static string SanitizeFileName(string value)
{
    var invalid = Path.GetInvalidFileNameChars().ToHashSet();
    var sanitized = new string(value.Select(character => invalid.Contains(character) ? '_' : character).ToArray()).Trim();
    return string.IsNullOrWhiteSpace(sanitized) ? "tenant" : sanitized;
}

internal sealed record MigrationLogEntry(Guid TenantId, string Tenant, IReadOnlyList<string> PendingMigrations, bool Apply, string Status, string? BackupPath, DateTime TimestampUtc, string? Error = null);
internal sealed record MigrationArguments(bool Apply, string? Tenant, string? PgDumpPath, string? BackupDirectory, string? LogPath)
{
    public static MigrationArguments Parse(string[] args)
    {
        string? Value(string name)
        {
            var index = Array.FindIndex(args, x => string.Equals(x, name, StringComparison.OrdinalIgnoreCase));
            return index >= 0 && index + 1 < args.Length ? args[index + 1] : null;
        }
        return new(args.Contains("--apply", StringComparer.OrdinalIgnoreCase), Value("--tenant"), Value("--pg-dump"), Value("--backup-directory"), Value("--log"));
    }
}
