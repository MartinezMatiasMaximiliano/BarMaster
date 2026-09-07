namespace BackEndAPI.Impresion.Qz;

public interface IServicioFirmaQz
{
    EstadoFirmaQz Estado { get; }
    string ObtenerCertificadoPublicoPem();
    string FirmarResumen(string resumen);
}
