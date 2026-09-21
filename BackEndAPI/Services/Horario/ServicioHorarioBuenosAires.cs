namespace BackEndAPI.Services.Horario;

public sealed class ServicioHorarioBuenosAires(TimeProvider reloj) : IServicioHorario
{
    private static readonly TimeZoneInfo Zona = TimeZoneInfo.FindSystemTimeZoneById("America/Argentina/Buenos_Aires");
    public DateTimeOffset Ahora => reloj.GetUtcNow();
    public DateTime AUtc(DateTimeOffset instante) => instante.UtcDateTime;

    public (DateTime DesdeUtc, DateTime HastaExclusiveUtc) RangoDiaLocal(DateTimeOffset desde, DateTimeOffset? hasta = null)
    {
        var inicioLocal = TimeZoneInfo.ConvertTime(desde, Zona).Date;
        var finLocal = TimeZoneInfo.ConvertTime(hasta ?? desde, Zona).Date.AddDays(1);
        var inicio = TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(inicioLocal, DateTimeKind.Unspecified), Zona);
        var fin = TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(finLocal, DateTimeKind.Unspecified), Zona);
        return (inicio, fin);
    }
}
