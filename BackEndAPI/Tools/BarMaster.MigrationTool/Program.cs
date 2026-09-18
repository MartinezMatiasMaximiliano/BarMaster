using BackEndAPI.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;

var arguments = MigrationArguments.Parse(args);
var masterConnection = Environment.GetEnvironmentVariable("BARMASTER_MASTER_CONNECTION");
if (string.IsNullOrWhiteSpace(masterConnection))
{
    Console.Error.WriteLine("Definí BARMASTER_MASTER_CONNECTION. La herramienta nunca imprime esa credencial.");
    return 2;
}

if (arguments.Apply)
{
    if (string.IsNullOrWhiteSpace(arguments.PgDumpPath) || !File.Exists(arguments.PgDumpPath))
    {
        Console.Error.WriteLine("Para aplicar, --pg-dump debe apuntar a un pg_dump ejecutable.");
        return 2;
    }

    if (string.IsNullOrWhiteSpace(arguments.BackupDirectory))
    {
        Console.Error.WriteLine("Para aplicar, --backup-directory es obligatorio.");
        return 2;
    }

    Directory.CreateDirectory(arguments.BackupDirectory);
}

var masterOptions = new DbContextOptionsBuilder<MasterDbContext>().UseNpgsql(masterConnection).Options;
await using var masterDb = new MasterDbContext(masterOptions);
var tenantQuery = masterDb.Tenants.AsNoTracking();
if (!string.IsNullOrWhiteSpace(arguments.Tenant))
    tenantQuery = tenantQuery.Where(x => x.NombreEmpresa == arguments.Tenant);

var tenants = await tenantQuery.OrderBy(x => x.NombreEmpresa).ToListAsync();
if (tenants.Count == 0)
{
    Console.Error.WriteLine("No se encontraron empresas para procesar.");
    return 3;
}

var logPath = Path.GetFullPath(arguments.LogPath ?? Path.Combine(
    arguments.BackupDirectory ?? Directory.GetCurrentDirectory(),
    $"tenant-migration-{DateTime.UtcNow:yyyyMMdd-HHmmss}.jsonl"));
var logDirectory = Path.GetDirectoryName(logPath);
if (!string.IsNullOrWhiteSpace(logDirectory)) Directory.CreateDirectory(logDirectory);

var failures = 0;
foreach (var tenant in tenants)
{
    var tenantOptions = new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(tenant.ConnectionString).Options;
    await using var tenantDb = new AppDbContext(tenantOptions);
    IReadOnlyList<string> pending = Array.Empty<string>();
    var entry = new MigrationLogEntry(tenant.Id, tenant.NombreEmpresa, pending, arguments.Apply,
        "Inspecting", null, DateTime.UtcNow);

    try
    {
        pending = (await tenantDb.Database.GetPendingMigrationsAsync()).ToArray();
        entry = entry with { PendingMigrations = pending };
        Console.WriteLine($"{tenant.NombreEmpresa}: {pending.Count} migración(es) pendiente(s).");

        if (arguments.Apply && pending.Count > 0)
        {
            var safeTenantName = SanitizeFileName(tenant.NombreEmpresa);
            var backupPath = Path.Combine(arguments.BackupDirectory!,
                $"{safeTenantName}-{tenant.Id:N}-{DateTime.UtcNow:yyyyMMdd-HHmmss}.dump");
            await BackupAndValidateAsync(arguments.PgDumpPath!, tenant.ConnectionString, backupPath);
            entry = entry with { BackupPath = backupPath };
            await tenantDb.Database.MigrateAsync();
            entry = entry with { Status = "Migrated" };
            Console.WriteLine($"{tenant.NombreEmpresa}: backup validado y base actualizada.");
        }
        else
        {
            entry = entry with { Status = pending.Count == 0 ? "UpToDate" : "DryRun" };
        }
    }
    catch (Exception exception)
    {
        failures++;
        var safeError = RedactSensitiveData(exception.Message, tenant.ConnectionString);
        entry = entry with { Status = "Failed", Error = safeError };
        Console.Error.WriteLine($"{tenant.NombreEmpresa}: ERROR {exception.GetType().Name}: {safeError}");
    }

    await AppendLogAsync(logPath, entry);
}

if (!arguments.Apply)
    Console.WriteLine("Solo diagnóstico. Usá --apply junto con --pg-dump y --backup-directory para aplicar.");
Console.WriteLine($"Registro: {logPath}");
return failures == 0 ? 0 : 1;

static async Task BackupAndValidateAsync(string pgDumpPath, string connectionString, string destination)
{
    var connection = new NpgsqlConnectionStringBuilder(connectionString);
    var host = connection.Host ?? throw new InvalidOperationException("La conexión de la empresa no define Host.");
    var database = connection.Database ?? throw new InvalidOperationException("La conexión de la empresa no define Database.");
    var username = connection.Username ?? throw new InvalidOperationException("La conexión de la empresa no define Username.");

    var backup = new ProcessStartInfo(pgDumpPath)
    {
        UseShellExecute = false,
        RedirectStandardError = true,
        CreateNoWindow = true
    };
    foreach (var argument in new[]
             {
                 "--host", host, "--port", connection.Port.ToString(), "--username", username,
                 "--dbname", database, "--format", "custom", "--file", destination
             })
        backup.ArgumentList.Add(argument);
    if (!string.IsNullOrEmpty(connection.Password)) backup.Environment["PGPASSWORD"] = connection.Password;

    using var backupProcess = Process.Start(backup)
        ?? throw new InvalidOperationException("No se pudo iniciar pg_dump.");
    var backupError = await backupProcess.StandardError.ReadToEndAsync();
    await backupProcess.WaitForExitAsync();
    if (backupProcess.ExitCode != 0 || !File.Exists(destination) || new FileInfo(destination).Length == 0)
        throw new InvalidOperationException($"pg_dump falló con código {backupProcess.ExitCode}: {backupError}");

    var pgRestorePath = Path.Combine(Path.GetDirectoryName(Path.GetFullPath(pgDumpPath))!, "pg_restore.exe");
    if (!File.Exists(pgRestorePath))
        throw new InvalidOperationException("No se encontró pg_restore.exe junto a pg_dump.exe para validar el backup.");

    var validation = new ProcessStartInfo(pgRestorePath)
    {
        UseShellExecute = false,
        RedirectStandardError = true,
        CreateNoWindow = true
    };
    validation.ArgumentList.Add("--list");
    validation.ArgumentList.Add(destination);
    using var validationProcess = Process.Start(validation)
        ?? throw new InvalidOperationException("No se pudo iniciar pg_restore.");
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

static string RedactSensitiveData(string message, string connectionString)
{
    var result = message.Replace(connectionString, "[CONEXIÓN OCULTA]", StringComparison.Ordinal);
    try
    {
        var password = new NpgsqlConnectionStringBuilder(connectionString).Password;
        if (!string.IsNullOrEmpty(password))
            result = result.Replace(password, "[OCULTO]", StringComparison.Ordinal);
    }
    catch (ArgumentException)
    {
        // La expresión regular siguiente también cubre cadenas de conexión mal formadas.
    }

    return Regex.Replace(result, @"(?i)(password|pwd)\s*=\s*[^;\s]+", "$1=[OCULTO]");
}

internal sealed record MigrationLogEntry(Guid TenantId, string Tenant, IReadOnlyList<string> PendingMigrations,
    bool Apply, string Status, string? BackupPath, DateTime TimestampUtc, string? Error = null);

internal sealed record MigrationArguments(bool Apply, string? Tenant, string? PgDumpPath,
    string? BackupDirectory, string? LogPath)
{
    public static MigrationArguments Parse(string[] args)
    {
        string? Value(string name)
        {
            var index = Array.FindIndex(args, x => string.Equals(x, name, StringComparison.OrdinalIgnoreCase));
            return index >= 0 && index + 1 < args.Length ? args[index + 1] : null;
        }

        return new MigrationArguments(args.Contains("--apply", StringComparer.OrdinalIgnoreCase), Value("--tenant"),
            Value("--pg-dump"), Value("--backup-directory"), Value("--log"));
    }
}
