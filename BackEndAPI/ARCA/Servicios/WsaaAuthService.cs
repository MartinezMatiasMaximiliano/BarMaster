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

   // public async Task<WsaaLoginResult> AuthenticateAsync(X509Certificate2 cert);
}