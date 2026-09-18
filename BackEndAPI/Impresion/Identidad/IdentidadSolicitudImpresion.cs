using System.Security.Claims;

namespace BackEndAPI.Impresion.Identidad;

public sealed class IdentidadSolicitudImpresion : IIdentidadSolicitudImpresion
{
    private readonly IHttpContextAccessor accesorContextoHttp;

    public IdentidadSolicitudImpresion(IHttpContextAccessor accesorContextoHttp)
    {
        this.accesorContextoHttp = accesorContextoHttp;
    }

    public string IdInquilino => ObtenerClaimRequerido("TenantId");
    public Guid IdSucursal => ObtenerGuidRequerido("IdSucursal");
    public Guid? IdPersona => ObtenerGuidOpcional("IdPersona");
    public Guid? IdEstacion => ObtenerGuidOpcional("EstacionImpresionId");
    public string TipoAutenticacion => ObtenerClaimRequerido("TipoAuth");
    public string Rol => Usuario.FindFirstValue("RequestedRole") ?? string.Empty;

    private ClaimsPrincipal Usuario => accesorContextoHttp.HttpContext?.User
        ?? throw new InvalidOperationException("No existe un contexto HTTP activo.");

    private string ObtenerClaimRequerido(string nombre) =>
        Usuario.FindFirstValue(nombre)
        ?? throw new InvalidOperationException($"Falta el claim requerido '{nombre}'.");

    private Guid ObtenerGuidRequerido(string nombre) =>
        Guid.TryParse(ObtenerClaimRequerido(nombre), out var valor)
            ? valor
            : throw new InvalidOperationException($"El claim '{nombre}' no es un GUID válido.");

    private Guid? ObtenerGuidOpcional(string nombre)
    {
        var valor = Usuario.FindFirstValue(nombre);
        return Guid.TryParse(valor, out var convertido) ? convertido : null;
    }
}
