using System.ComponentModel.DataAnnotations;

namespace BackEndAPI.Impresion;

public sealed class OpcionesImpresionDistribuida
{
    public const string NombreSeccion = "ImpresionDistribuida";

    public bool Habilitada { get; init; } = true;
    public bool TrabajadorHabilitado { get; init; } = true;

    [Range(10, 300)]
    public int SegundosLatido { get; init; } = 30;

    [Range(30, 900)]
    public int SegundosHastaFueraDeLinea { get; init; } = 90;

    [Range(2, 300)]
    public int SegundosConsultaPeriodica { get; init; } = 15;

    [Range(15, 600)]
    public int SegundosReserva { get; init; } = 60;

    [Range(1, 100)]
    public int TamanoLoteReserva { get; init; } = 5;

    [Range(1, 3650)]
    public int DiasRetencionContenido { get; init; } = 30;

    [Range(1, 24)]
    public int HorasTokenEstacion { get; init; } = 8;

    [Range(30, 86400)]
    public int SegundosMantenimiento { get; init; } = 60;
}
