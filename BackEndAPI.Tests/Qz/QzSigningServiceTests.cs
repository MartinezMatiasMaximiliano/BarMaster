using BackEndAPI.Printing.Qz;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace BackEndAPI.Tests.Qz;

public sealed class QzSigningServiceTests
{
    [Fact]
    public void SignsCanonicalDigestWithRsaSha512()
    {
        using var bundle = TestCertificateBundle.Create();
        using var service = new QzSigningService(Options.Create(bundle.CreateOptions()), NullLogger<QzSigningService>.Instance);
        const string digest = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

        var signature = Convert.FromBase64String(service.SignDigest(digest));
        using var rsa = bundle.Leaf.GetRSAPublicKey();

        Assert.True(rsa!.VerifyData(Encoding.UTF8.GetBytes(digest), signature, HashAlgorithmName.SHA512, RSASignaturePadding.Pkcs1));
        Assert.Single(service.GetPublicCertificatePem().Split("-----BEGIN CERTIFICATE-----", StringSplitOptions.RemoveEmptyEntries));
        Assert.True(service.State.Ready);
    }

    [Theory]
    [InlineData("")]
    [InlineData("ABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCD")]
    [InlineData("xyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzx")]
    public void RejectsNonCanonicalDigest(string digest)
    {
        using var bundle = TestCertificateBundle.Create();
        using var service = new QzSigningService(Options.Create(bundle.CreateOptions()), NullLogger<QzSigningService>.Instance);
        Assert.Throws<ArgumentException>(() => service.SignDigest(digest));
    }

    [Fact]
    public void DisabledServiceDoesNotLoadFiles()
    {
        using var service = new QzSigningService(Options.Create(new QzSigningOptions { Enabled = false }), NullLogger<QzSigningService>.Instance);
        Assert.False(service.State.Ready);
        Assert.Throws<InvalidOperationException>(() => service.SignDigest(new string('a', 64)));
    }
}
