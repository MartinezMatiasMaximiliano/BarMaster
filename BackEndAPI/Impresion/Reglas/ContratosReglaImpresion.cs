using BackEndAPI.Models.Impresion;

namespace BackEndAPI.Impresion.Reglas;

public sealed record GuardarReglaImpresionSolicitud(
    Guid? Id,
    Guid IdImpresora,
    TipoSalidaImpresion TipoSalida,
    MomentoImpresion Momento,
    bool Habilitada = true);

public sealed record ReglaImpresionRespuesta(
    Guid Id,
    Guid IdImpresora,
    string NombreVisibleImpresora,
    Guid IdEstacion,
    string NombreEstacion,
    TipoSalidaImpresion TipoSalida,
    MomentoImpresion Momento,
    bool Habilitada,
    bool Disponible,
    DateTime ActualizadoEn,
    bool Compatible);

public sealed record ProblemaConfiguracionImpresion(string Codigo, string Mensaje, Guid? IdRelacionado);
public sealed record ValidacionConfiguracionImpresionRespuesta(bool EsValida, IReadOnlyList<ProblemaConfiguracionImpresion> Problemas);
