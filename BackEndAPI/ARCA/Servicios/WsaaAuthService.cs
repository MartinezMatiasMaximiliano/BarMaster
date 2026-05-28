using BackEndAPI.ARCA.Clases;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Xml.Linq;

public class WsaaAuthService
{
    private readonly TraGenerator _traGenerator;
    private readonly CmsSignerService _cmsSigner;
    private readonly HttpClient _httpClient;

    public WsaaAuthService(
        TraGenerator traGenerator,
        CmsSignerService cmsSigner,
        HttpClient httpClient)
    {
        _traGenerator = traGenerator;
        _cmsSigner = cmsSigner;
        _httpClient = httpClient;
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

    public async Task<ArcaAuthResponse> AuthenticateAsync(X509Certificate2 cert)
    {
        try
        {
            var traXml = _traGenerator.Generate("wsfe");
            var cmsBase64 = _cmsSigner.Sign(traXml, cert);
            var soapEnvelope = BuildSoapEnvelope(cmsBase64);
            var content = new StringContent(soapEnvelope, Encoding.UTF8,"text/xml");
            content.Headers.Add("SOAPAction","\"\"");
            var url = "https://wsaahomo.afip.gov.ar/ws/services/LoginCms";
            var response = await _httpClient.PostAsync(url,content);
            var responseXml = await response.Content.ReadAsStringAsync();
            Console.WriteLine(response.StatusCode);

            Console.WriteLine(responseXml);


            var soapDoc = XDocument.Parse(responseXml);

            XNamespace ns = "http://wsaa.view.sua.dvadac.desein.afip.gov";

            var loginCmsReturn = soapDoc.Descendants(ns + "loginCmsReturn").First().Value;
            var loginTicketXml = XDocument.Parse(loginCmsReturn);
            var token = loginTicketXml.Descendants("token").First().Value;
            var sign = loginTicketXml.Descendants("sign").First().Value;
            var expiration = loginTicketXml.Descendants("expirationTime").First().Value;

            return new ArcaAuthResponse
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