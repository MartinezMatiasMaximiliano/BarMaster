using System.Security.Claims;

namespace BackEndAPI.Impresion.Seguridad;

public static class AutorizacionImpresion
{
    public static bool PuedeConfigurar(ClaimsPrincipal usuario)
    {
        if (!TieneInquilinoYSucursal(usuario)) return false;

        var tipoAutenticacion = usuario.FindFirstValue("TipoAuth");
        if (string.Equals(tipoAutenticacion, "sucursal", StringComparison.OrdinalIgnoreCase))
            return true;

        return string.Equals(tipoAutenticacion, "admin", StringComparison.OrdinalIgnoreCase)
            && usuario.Claims.Any(claim => claim.Type == "RequestedRole"
                && string.Equals(claim.Value, "Admin", StringComparison.OrdinalIgnoreCase));
    }

    private static bool TieneInquilinoYSucursal(ClaimsPrincipal usuario) =>
        usuario.HasClaim(claim => claim.Type == "TenantId" && !string.IsNullOrWhiteSpace(claim.Value))
        && usuario.HasClaim(claim => claim.Type == "IdSucursal" && Guid.TryParse(claim.Value, out _));
}
