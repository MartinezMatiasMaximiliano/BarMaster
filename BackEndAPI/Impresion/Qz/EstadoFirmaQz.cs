namespace BackEndAPI.Impresion.Qz;

public sealed record EstadoFirmaQz(
    bool Habilitada,
    bool Lista,
    bool Degradado,
    DateTime? ValidoDesdeUtc,
    DateTime? ValidoHastaUtc,
    int? DiasRestantes,
    string? Sha256Certificado,
    string? Sha256CertificadoRaiz);
