using BackEndAPI.ARCA.Clases;
using Microsoft.CodeAnalysis.Options;
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

    public WsaaAuthService(TraGenerator traGenerator, CmsSignerService cmsSigner, HttpClient httpClient, IOptions<ArcaOptions> arcaOptions)
    {
        _traGenerator = traGenerator;
        _cmsSigner = cmsSigner;
        _httpClient = httpClient;
        _arcaOptions = arcaOptions.Value;
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

    public async Task<FEAuthResponse> AuthenticateAsync(X509Certificate2 cert)
    {
        try
        {
            var traXml = _traGenerator.Generate();
            var cmsBase64 = _cmsSigner.Sign(traXml, cert);
            var soapEnvelope = BuildSoapEnvelope(cmsBase64);
            var content = new StringContent(soapEnvelope, Encoding.UTF8, "text/xml");
            content.Headers.Add("SOAPAction", "\"\"");
            var response = await _httpClient.PostAsync(_arcaOptions.WsaaUrl, content);
            var responseXml = await response.Content.ReadAsStringAsync();

            var soapDoc = XDocument.Parse(responseXml);

            XNamespace ns = "http://wsaa.view.sua.dvadac.desein.afip.gov";

            var loginCmsReturn = soapDoc.Descendants(ns + "loginCmsReturn").First().Value;
            var loginTicketXml = XDocument.Parse(loginCmsReturn);
            var token = loginTicketXml.Descendants("token").First().Value;
            var sign = loginTicketXml.Descendants("sign").First().Value;
            var expiration = loginTicketXml.Descendants("expirationTime").First().Value;

            return new FEAuthResponse
            {
                Token = token,
                Sign = sign,
                ExpirationTime = DateTime.Parse(expiration)
            };
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
}