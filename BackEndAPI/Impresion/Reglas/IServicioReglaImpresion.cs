using BackEndAPI.Models.Impresion;

namespace BackEndAPI.Impresion.Reglas;

public interface IServicioReglaImpresion
{
    Task<IReadOnlyList<ReglaImpresionRespuesta>> ObtenerTodasAsync(CancellationToken tokenCancelacion);
    Task<ReglaImpresionRespuesta> GuardarAsync(GuardarReglaImpresionSolicitud solicitud, CancellationToken tokenCancelacion);
    Task EliminarAsync(Guid idRegla, CancellationToken tokenCancelacion);
    Task<ValidacionConfiguracionImpresionRespuesta> ValidarAsync(CancellationToken tokenCancelacion);
    Task<IReadOnlyList<ReglaImpresion>> ResolverAsync(
        TipoDocumentoImpresion documentType,
        MomentoImpresion trigger,
        CancellationToken tokenCancelacion);
}
