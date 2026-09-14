using BackEndAPI.ARCA.Clases;
using BackEndAPI.Data;
using BackEndAPI.Exceptions;
using BackEndAPI.Models;
using BackEndAPI.Services.Amazon;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Xml.Linq;

public class WsaaAuthService
{
    // WSAA: https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL
    // WSAA: web service de autenticación y autorización de AFIP

    private readonly TraGenerator _traGenerator;
    private readonly CmsSignerService _cmsSigner;
    private readonly HttpClient _httpClient;
    private readonly ArcaOptions _arcaOptions;
    private readonly ICurrentDbContext _currentDbContext;
    private readonly S3Service _s3Service;
    private readonly ILogger<WsaaAuthService> _logger;
    private readonly AppDbContext db;

    public WsaaAuthService(
        TraGenerator traGenerator,
        CmsSignerService cmsSigner,
        HttpClient httpClient,
        IOptions<ArcaOptions> arcaOptions,
        ICurrentDbContext currentDbContext,
        S3Service s3Service,
        ILogger<WsaaAuthService> logger)
    {
        _traGenerator = traGenerator;
        _cmsSigner = cmsSigner;
        _httpClient = httpClient;
        _arcaOptions = arcaOptions.Value;
        _currentDbContext = currentDbContext;
        _s3Service = s3Service;
        _logger = logger;
        db = _currentDbContext.Db;
    }

    private string BuildSoapEnvelope(string cms)
    {
        return $"""
        <?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xmlns:xsd="http://www.w3.org/2001/XMLSchema"
            xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">

            <soap:Body>
                <loginCms xmlns="http://wsaa.view.sua.dvadac.desein.afip.gov">
                    <in0>{cms}</in0>
                </loginCms>
            </soap:Body>

        </soap:Envelope>
        """;
    }
    public async Task<FEAuthResponse> AutenticarFacturacionElectronica(Empresa empresa)
    {
        var tokenExistente = await db.FETokenAuths.Where(t => t.ExpirationTime > DateTime.UtcNow).FirstOrDefaultAsync();
        if (tokenExistente != null)
        {
            return new FEAuthResponse
            {
                Token = tokenExistente.Token,
                Sign = tokenExistente.Sign,
                ExpirationTime = tokenExistente.ExpirationTime
            };
        }
        return await AuthenticateAsync(empresa);
    }

    public async Task<FEAuthResponse> AuthenticateAsync(Empresa empresa)
    {
        if (string.IsNullOrEmpty(empresa.ubicacionCert))
            throw new BusinessRuleException("No se encontró la ubicación del certificado de la empresa");
        if (string.IsNullOrEmpty(empresa.CertPassword))
            throw new BusinessRuleException("No se encontró la contraseña del certificado de la empresa");

        var cert = await BuscarCertificado(empresa.ubicacionCert, empresa.CertPassword);
        var traXml = _traGenerator.Generate();
        var cmsBase64 = _cmsSigner.Sign(traXml, cert);
        var soapEnvelope = BuildSoapEnvelope(cmsBase64);
        var content = new StringContent(soapEnvelope, Encoding.UTF8, "text/xml");
        content.Headers.Add("SOAPAction", "\"\"");
        var response = await _httpClient.PostAsync(_arcaOptions.WsaaUrl, content);
        var responseXml = await response.Content.ReadAsStringAsync();

        var soapDoc = XDocument.Parse(responseXml);

        XNamespace ns = "http://wsaa.view.sua.dvadac.desein.afip.gov";

        var loginCmsReturnEl = soapDoc.Descendants(ns + "loginCmsReturn").FirstOrDefault();
        if (loginCmsReturnEl == null)
        {
            _logger.LogError("WSAA no devolvió loginCmsReturn. Respuesta cruda: {RespuestaWsaa}", responseXml);
            throw new BusinessRuleException("No se pudo autenticar contra AFIP/ARCA (WSAA). Revisá el certificado y sus permisos para el servicio de Facturación Electrónica.");
        }

        var loginTicketXml = XDocument.Parse(loginCmsReturnEl.Value);
        var token = loginTicketXml.Descendants("token").First().Value;
        var sign = loginTicketXml.Descendants("sign").First().Value;
        var expiration = loginTicketXml.Descendants("expirationTime").First().Value;

        var newTokenAuth = new FETokenAuth
        {
            Token = token,
            Sign = sign,
            ExpirationTime = DateTime.Parse(expiration).ToUniversalTime()
        };

        await db.FETokenAuths.AddAsync(newTokenAuth);
        await db.SaveChangesAsync();

        return new FEAuthResponse
        {
            Token = token,
            Sign = sign,
            ExpirationTime = DateTime.Parse(expiration)
        };
    }

    private async Task<X509Certificate2> BuscarCertificado(string key, string password)
    {
        var bytes = await _s3Service.ObtenerArchivo(key);
        return CertificateLoader.Load(bytes, password);
    }

}
