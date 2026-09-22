using BackEndAPI.Models.Impresion;
using BackEndAPI.Impresion.Identidad;
using BackEndAPI.Impresion.Estaciones;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BackEndAPI.Impresion.Seguridad;

public sealed class ServicioCredencialEstacion : IServicioCredencialEstacion
{
    private readonly ICurrentDbContext contextoDbActual;
    private readonly IServicioEstacionImpresion servicioEstacion;
    private readonly IIdentidadSolicitudImpresion identidad;
    private readonly IConfiguration configuracion;
    private readonly IHttpContextAccessor accesorContextoHttp;
    private readonly OpcionesImpresionDistribuida opciones;
    private readonly TimeProvider proveedorTiempo;

    public ServicioCredencialEstacion(
        ICurrentDbContext contextoDbActual,
        IServicioEstacionImpresion servicioEstacion,
        IIdentidadSolicitudImpresion identidad,
        IConfiguration configuracion,
        IHttpContextAccessor accesorContextoHttp,
        IOptions<OpcionesImpresionDistribuida> opciones,
        TimeProvider proveedorTiempo)
    {
        this.contextoDbActual = contextoDbActual;
        this.servicioEstacion = servicioEstacion;
        this.identidad = identidad;
        this.configuracion = configuracion;
        this.accesorContextoHttp = accesorContextoHttp;
        this.opciones = opciones.Value;
        this.proveedorTiempo = proveedorTiempo;
    }

    public async Task<AltaEstacionImpresionRespuesta> DarAltaAsync(
        DarAltaEstacionImpresionSolicitud solicitud,
        CancellationToken tokenCancelacion)
    {
        AsegurarHabilitada();
        var respuesta = await servicioEstacion.RegistrarAsync(
            new(solicitud.IdInstalacionCliente, solicitud.Nombre), tokenCancelacion);
        var estacion = await contextoDbActual.Db.EstacionesImpresion.SingleAsync(x => x.Id == respuesta.Id, tokenCancelacion);

        if (!string.IsNullOrWhiteSpace(estacion.HashCredencial))
            return new(respuesta, null, true);

        var credencial = EmitirCredencial(estacion);
        await contextoDbActual.Db.SaveChangesAsync(tokenCancelacion);
        return new(respuesta, credencial, false);
    }

    public async Task<RotarCredencialEstacionImpresionRespuesta> RotarAsync(
        Guid idEstacion,
        CancellationToken tokenCancelacion)
    {
        AsegurarHabilitada();
        var estacion = await contextoDbActual.Db.EstacionesImpresion.SingleOrDefaultAsync(
            x => x.Id == idEstacion && x.IdSucursal == identidad.IdSucursal,
            tokenCancelacion)
            ?? throw new ExcepcionEstacionImpresion("ESTACION_NO_ENCONTRADA", "La estación no existe en esta sucursal.", StatusCodes.Status404NotFound);

        var credencial = EmitirCredencial(estacion);
        estacion.Habilitada = true;
        estacion.RevocadaEn = null;
        await contextoDbActual.Db.SaveChangesAsync(tokenCancelacion);
        return new(estacion.Id, credencial, estacion.CredencialCreadaEn!.Value);
    }

    public async Task<SesionEstacionImpresionRespuesta> CrearSesionAsync(
        CrearSesionEstacionImpresionSolicitud solicitud,
        CancellationToken tokenCancelacion)
    {
        AsegurarHabilitada();
        var estacion = await contextoDbActual.Db.EstacionesImpresion.AsNoTracking().SingleOrDefaultAsync(
            x => x.IdSucursal == solicitud.IdSucursal && x.IdInstalacionCliente == solicitud.IdInstalacionCliente,
            tokenCancelacion);

        if (estacion is null || !estacion.Habilitada || estacion.RevocadaEn is not null
            || string.IsNullOrWhiteSpace(estacion.HashCredencial)
            || !CoincideCredencial(solicitud.Credencial, estacion.HashCredencial))
        {
            throw new ExcepcionEstacionImpresion(
                "CREDENCIAL_ESTACION_INVALIDA",
                "No se pudo autenticar este equipo de impresión.",
                StatusCodes.Status401Unauthorized);
        }

        var ahora = proveedorTiempo.GetUtcNow().UtcDateTime;
        var venceEn = ahora.AddHours(opciones.HorasTokenEstacion);
        var idInquilino = accesorContextoHttp.HttpContext?.Items["TenantId"]?.ToString();
        if (!Guid.TryParse(idInquilino, out _))
            throw new ExcepcionEstacionImpresion("EMPRESA_REQUERIDA", "Falta identificar la empresa.", StatusCodes.Status400BadRequest);
        var claimsJwt = new[]
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("TenantId", idInquilino),
            new Claim("IdSucursal", estacion.IdSucursal.ToString()),
            new Claim("EstacionImpresionId", estacion.Id.ToString()),
            new Claim("TipoAuth", "estacion_impresion")
        };
        var claveFirma = configuracion["JWT:SigningKey"]
            ?? throw new InvalidOperationException("JWT SigningKey not configured");
        var credencialesFirma = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(claveFirma)),
            SecurityAlgorithms.HmacSha256);
        var tokenJwt = new JwtSecurityToken(
            configuracion["JWT:Issuer"],
            configuracion["JWT:Audience"],
            claimsJwt,
            notBefore: ahora,
            expires: venceEn,
            signingCredentials: credencialesFirma);

        return new(new JwtSecurityTokenHandler().WriteToken(tokenJwt), venceEn, estacion.Id, estacion.IdSucursal);
    }

    private string EmitirCredencial(EstacionImpresion estacion)
    {
        var credencial = Base64UrlEncoder.Encode(RandomNumberGenerator.GetBytes(32));
        estacion.HashCredencial = CalcularHashCredencial(credencial);
        estacion.CredencialCreadaEn = proveedorTiempo.GetUtcNow().UtcDateTime;
        return credencial;
    }

    private static bool CoincideCredencial(string credencial, string hexadecimalEsperado)
    {
        try
        {
            var esperado = Convert.FromHexString(hexadecimalEsperado);
            var actual = SHA256.HashData(Encoding.UTF8.GetBytes(credencial));
            return CryptographicOperations.FixedTimeEquals(actual, esperado);
        }
        catch (FormatException)
        {
            return false;
        }
    }

    private static string CalcularHashCredencial(string credencial) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(credencial)));

    private void AsegurarHabilitada()
    {
        if (!opciones.Habilitada)
            throw new ExcepcionEstacionImpresion(
                "IMPRESION_DISTRIBUIDA_DESHABILITADA",
                "La impresión distribuida no está habilitada.",
                StatusCodes.Status503ServiceUnavailable);
    }
}
