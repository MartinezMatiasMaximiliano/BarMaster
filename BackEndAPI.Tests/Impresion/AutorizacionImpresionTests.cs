using BackEndAPI.Impresion.Seguridad;
using System.Security.Claims;

namespace BackEndAPI.Tests.Impresion;

public sealed class AutorizacionImpresionTests
{
    private static readonly Guid IdSucursal = Guid.NewGuid();

    [Fact]
    public void CredencialSucursal_PuedeConfigurarImpresion()
    {
        Assert.True(AutorizacionImpresion.PuedeConfigurar(Usuario("sucursal")));
    }

    [Fact]
    public void Administrador_PuedeConfigurarImpresion()
    {
        Assert.True(AutorizacionImpresion.PuedeConfigurar(Usuario("admin", "Admin")));
    }

    [Theory]
    [InlineData("admin", "Mozo")]
    [InlineData("estacion_impresion", null)]
    public void OtrasIdentidades_NoPuedenConfigurarImpresion(string tipoAutenticacion, string? rol)
    {
        Assert.False(AutorizacionImpresion.PuedeConfigurar(Usuario(tipoAutenticacion, rol)));
    }

    [Fact]
    public void IdentidadSinSucursal_NoPuedeConfigurarImpresion()
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("TenantId", "tenant"),
            new Claim("TipoAuth", "sucursal")
        }, "test"));

        Assert.False(AutorizacionImpresion.PuedeConfigurar(user));
    }

    private static ClaimsPrincipal Usuario(string tipoAutenticacion, string? rol = null)
    {
        var claims = new List<Claim>
        {
            new("TenantId", "tenant"),
            new("IdSucursal", IdSucursal.ToString()),
            new("TipoAuth", tipoAutenticacion)
        };
        if (rol is not null) claims.Add(new Claim("RequestedRole", rol));
        return new ClaimsPrincipal(new ClaimsIdentity(claims, "test"));
    }
}
