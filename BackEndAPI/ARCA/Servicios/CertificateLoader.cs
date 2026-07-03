using System.Security.Cryptography.X509Certificates;

public static class CertificateLoader
{
    public static X509Certificate2 Load(byte[] certificateBytes,string password){
        return new X509Certificate2(
            certificateBytes,
            password,
            X509KeyStorageFlags.MachineKeySet |
            X509KeyStorageFlags.Exportable
        );
    }
}