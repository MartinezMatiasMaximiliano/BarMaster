using BackEndAPI.Printing.Identity;

namespace BackEndAPI.Tests.Printing;

internal sealed class FakePrintingIdentity : IPrintingRequestIdentity
{
    public string TenantId { get; init; } = "tenant-test";
    public Guid SucursalId { get; init; }
    public Guid? PersonaId { get; init; }
    public string AuthenticationType { get; init; } = "sucursal";
    public string Role { get; init; } = string.Empty;
}
