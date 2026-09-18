namespace BackEndAPI.Impresion.Qz;

public sealed class OpcionesFirmaQz
{
    public const string NombreSeccion = "FirmaQz";

    public bool Habilitada { get; set; }
    public bool PermitirEstacionesNoRegistradasEnDesarrollo { get; set; }
    public string RutaPfx { get; set; } = string.Empty;
    public string ContrasenaPfx { get; set; } = string.Empty;
    public string RutaCertificadoRaiz { get; set; } = string.Empty;
    public string Sha256CertificadoEsperado { get; set; } = string.Empty;
    public string Sha256CertificadoRaizEsperado { get; set; } = string.Empty;
    public int MinimoDiasRestantes { get; set; } = 30;
}
