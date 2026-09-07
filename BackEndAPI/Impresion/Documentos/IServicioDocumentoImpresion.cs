using BackEndAPI.Models;
using BackEndAPI.Impresion.Trabajos;

namespace BackEndAPI.Impresion.Documentos;

public interface IServicioDocumentoImpresion
{
    Task<CrearSolicitudImpresionRespuesta> SolicitarPreticketAsync(ImprimirPreticketSolicitud solicitud, CancellationToken tokenCancelacion);
    Task<IReadOnlyList<CrearSolicitudImpresionRespuesta>> EncolarComandasAsync(
        Visita visit,
        IReadOnlyList<ProductosPorVisita> productosAgregados,
        Guid idComando,
        CancellationToken tokenCancelacion);
}
