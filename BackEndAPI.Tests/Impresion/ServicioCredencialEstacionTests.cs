using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Impresion;
using BackEndAPI.Impresion.Seguridad;
using BackEndAPI.Impresion.Estaciones;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;

namespace BackEndAPI.Tests.Impresion;

public sealed class ServicioCredencialEstacionTests
{
    [Fact]
    public async Task AltaGuardaSoloHashYEmiteTokenLimitadoAEstacion()
    {
        await using var db = CrearDb();
        var branch = new Sucursal { Id = Guid.NewGuid(), IdEmpresa = Guid.NewGuid(), Nombre = "Sucursal", Username = "sucursal" };
        branch.EstablecerContrasena([1], [2]); db.Sucursales.Add(branch); await db.SaveChangesAsync();
        var identity = new IdentidadImpresionFalsa { IdSucursal = branch.Id, TipoAutenticacion = "admin", Rol = "Admin" };
        var http = new DefaultHttpContext(); http.Request.Headers["X-Tenant-ID"] = "tenant-test";
        var accessor = new HttpContextAccessor { HttpContext = http };
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["JWT:SigningKey"] = new string('a', 64), ["JWT:Issuer"] = "test", ["JWT:Audience"] = "test"
        }).Build();
        var options = Options.Create(new OpcionesImpresionDistribuida());
        var current = new ContextoDbActualFalso(db);
        var service = new ServicioCredencialEstacion(current, new ServicioEstacionImpresion(current, identity, TimeProvider.System), identity, configuration, accessor, options, TimeProvider.System);
        var installation = Guid.NewGuid();

        var enrollment = await service.DarAltaAsync(new(installation, "Caja"), default);
        Assert.NotNull(enrollment.Credencial);
        Assert.NotEqual(enrollment.Credencial, (await db.EstacionesImpresion.SingleAsync()).HashCredencial);
        var session = await service.CrearSesionAsync(new(branch.Id, installation, enrollment.Credencial!), default);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(session.TokenAcceso);
        Assert.Equal(enrollment.Estacion.Id.ToString(), jwt.Claims.Single(x => x.Type == "EstacionImpresionId").Value);
        Assert.Equal("estacion_impresion", jwt.Claims.Single(x => x.Type == "TipoAuth").Value);
    }

    private static AppDbContext CrearDb() => new(new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning)).Options);
}
