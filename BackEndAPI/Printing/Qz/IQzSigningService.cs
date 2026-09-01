namespace BackEndAPI.Printing.Qz;

public interface IQzSigningService
{
    QzSigningState State { get; }
    string GetPublicCertificatePem();
    string SignDigest(string digest);
}
