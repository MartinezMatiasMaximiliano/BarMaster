namespace BackEndAPI.Tenancy.Services;

public static class TenantIdentifier
{
    public static string Normalize(string value) =>
        value.Trim().ToLowerInvariant().Replace(" ", string.Empty, StringComparison.Ordinal);
}
