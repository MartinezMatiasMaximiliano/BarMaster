namespace BackEndAPI.Impresion.Seguridad;

public interface IServicioCredencialEstacion
{
    Task<AltaEstacionImpresionRespuesta> DarAltaAsync(DarAltaEstacionImpresionSolicitud solicitud, CancellationToken tokenCancelacion);
    Task<RotarCredencialEstacionImpresionRespuesta> RotarAsync(Guid idEstacion, CancellationToken tokenCancelacion);
    Task<SesionEstacionImpresionRespuesta> CrearSesionAsync(CrearSesionEstacionImpresionSolicitud solicitud, CancellationToken tokenCancelacion);
}
