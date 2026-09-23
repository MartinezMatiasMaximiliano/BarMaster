using System.Security.Claims;
using BackEndAPI.Models;

namespace BackEndAPI.Impresion.Seguridad;

public static class AutorizacionImpresion
{
    public static bool PuedeConfigurar(ClaimsPrincipal usuario)
    {
        if (!TieneTenantYSucursal(usuario)) return false;

        var tipoAutenticacion = usuario.FindFirstValue("TipoAuth");
        if (string.Equals(tipoAutenticacion, "sucursal", StringComparison.OrdinalIgnoreCase))
            return true;

        return string.Equals(tipoAutenticacion, "admin", StringComparison.OrdinalIgnoreCase)
            && usuario.Claims.Any(claim => claim.Type == "IdRol"
                && int.TryParse(claim.Value, out var idRol) && idRol == Roles.Admin);
    }

    public static bool PuedeConfigurarReglas(ClaimsPrincipal usuario)
    {
        if (!TieneTenantYSucursal(usuario)) return false;

        var tipoAutenticacion = usuario.FindFirstValue("TipoAuth");
        if (string.Equals(tipoAutenticacion, "sucursal", StringComparison.OrdinalIgnoreCase))
            return true;

        var esPersonaAutorizada = string.Equals(tipoAutenticacion, "admin", StringComparison.OrdinalIgnoreCase)
            || string.Equals(tipoAutenticacion, "cajero", StringComparison.OrdinalIgnoreCase);

        return esPersonaAutorizada
            && usuario.Claims.Any(claim => claim.Type == "IdRol"
                && int.TryParse(claim.Value, out var idRol) && Roles.PuedeIniciarSesion(idRol));
    }

    private static bool TieneTenantYSucursal(ClaimsPrincipal usuario) =>
        usuario.HasClaim(claim => claim.Type == "TenantId" && !string.IsNullOrWhiteSpace(claim.Value))
        && usuario.HasClaim(claim => claim.Type == "IdSucursal" && Guid.TryParse(claim.Value, out _));
}
