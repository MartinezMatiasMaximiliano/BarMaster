namespace BackEndAPI.Services.Horario;

public interface IServicioHorario
{
    DateTime AUtc(DateTimeOffset instante);
    (DateTime DesdeUtc, DateTime HastaExclusiveUtc) RangoDiaLocal(DateTimeOffset desde, DateTimeOffset? hasta = null);
    DateTimeOffset Ahora { get; }
}
