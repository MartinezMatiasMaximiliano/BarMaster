using System.Security.Cryptography.Pkcs;
using System.Security.Cryptography.X509Certificates;
using System.Text;

public class CmsSignerService
{
    public string Sign(string xml, X509Certificate2 cert)
    {
        var contentBytes = Encoding.UTF8.GetBytes(xml);
        var contentInfo = new ContentInfo(contentBytes);
        var signedCms = new SignedCms(contentInfo);
        var signer = new CmsSigner(cert);
        signedCms.ComputeSignature(signer);
        var cmsBytes = signedCms.Encode();
        return Convert.ToBase64String(cmsBytes);
    }
}