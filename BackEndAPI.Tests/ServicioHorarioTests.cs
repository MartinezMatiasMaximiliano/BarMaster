using BackEndAPI.Services.Horario;

namespace BackEndAPI.Tests;

public sealed class ServicioHorarioTests
{
    [Fact]
    public void RangoDiarioUsaBuenosAiresSinDependerDeZonaDelServidor()
    {
        var servicio = new ServicioHorarioBuenosAires(new RelojFijo(new DateTimeOffset(2030, 1, 1, 0, 0, 0, TimeSpan.Zero)));

        var (desde, hasta) = servicio.RangoDiaLocal(
            new DateTimeOffset(2030, 1, 2, 23, 59, 0, TimeSpan.FromHours(-3)));

        Assert.Equal(new DateTime(2030, 1, 2, 3, 0, 0, DateTimeKind.Utc), desde);
        Assert.Equal(new DateTime(2030, 1, 3, 3, 0, 0, DateTimeKind.Utc), hasta);
        Assert.Equal(TimeSpan.FromHours(24), hasta - desde);
    }

    [Fact]
    public void InstantesConDistintoOffsetSePersistenComoElMismoUtc()
    {
        var servicio = new ServicioHorarioBuenosAires(new RelojFijo(DateTimeOffset.UnixEpoch));
        Assert.Equal(
            servicio.AUtc(new DateTimeOffset(2030, 1, 2, 20, 0, 0, TimeSpan.FromHours(-3))),
            servicio.AUtc(new DateTimeOffset(2030, 1, 2, 23, 0, 0, TimeSpan.Zero)));
    }

    private sealed class RelojFijo(DateTimeOffset ahora) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => ahora;
    }
}
