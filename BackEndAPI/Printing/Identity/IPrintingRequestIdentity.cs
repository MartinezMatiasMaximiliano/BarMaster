namespace BackEndAPI.Printing.Identity;

public interface IPrintingRequestIdentity
{
    string TenantId { get; }
    Guid SucursalId { get; }
    Guid? PersonaId { get; }
    string AuthenticationType { get; }
    string Role { get; }
}
