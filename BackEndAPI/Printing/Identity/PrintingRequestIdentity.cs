using System.Security.Claims;

namespace BackEndAPI.Printing.Identity;

public sealed class PrintingRequestIdentity : IPrintingRequestIdentity
{
    private readonly IHttpContextAccessor httpContextAccessor;

    public PrintingRequestIdentity(IHttpContextAccessor httpContextAccessor)
    {
        this.httpContextAccessor = httpContextAccessor;
    }

    public string TenantId => GetRequiredClaim("TenantId");
    public Guid SucursalId => GetRequiredGuid("IdSucursal");
    public Guid? PersonaId => GetOptionalGuid("IdPersona");
    public string AuthenticationType => GetRequiredClaim("TipoAuth");
    public string Role => User.FindFirstValue("RequestedRole") ?? string.Empty;

    private ClaimsPrincipal User => httpContextAccessor.HttpContext?.User
        ?? throw new InvalidOperationException("No existe un contexto HTTP activo.");

    private string GetRequiredClaim(string name) =>
        User.FindFirstValue(name)
        ?? throw new InvalidOperationException($"Falta el claim requerido '{name}'.");

    private Guid GetRequiredGuid(string name) =>
        Guid.TryParse(GetRequiredClaim(name), out var value)
            ? value
            : throw new InvalidOperationException($"El claim '{name}' no es un GUID válido.");

    private Guid? GetOptionalGuid(string name)
    {
        var value = User.FindFirstValue(name);
        return Guid.TryParse(value, out var parsed) ? parsed : null;
    }
}
