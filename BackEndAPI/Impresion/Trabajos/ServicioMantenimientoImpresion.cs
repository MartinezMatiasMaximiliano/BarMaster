using BackEndAPI.Data;
using BackEndAPI.Models.Impresion;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BackEndAPI.Impresion.Trabajos;

public sealed class ServicioMantenimientoImpresion : BackgroundService
{
    private const string MigracionImpresionDistribuida = "20260904222221_EspanolizarModuloImpresion";
    private readonly IServiceScopeFactory fabricaAmbitos;
    private readonly OpcionesImpresionDistribuida opciones;
    private readonly TimeProvider proveedorTiempo;
    private readonly ILogger<ServicioMantenimientoImpresion> registrador;

    public ServicioMantenimientoImpresion(IServiceScopeFactory fabricaAmbitos, IOptions<OpcionesImpresionDistribuida> opciones,
        TimeProvider proveedorTiempo, ILogger<ServicioMantenimientoImpresion> registrador)
    {
        this.fabricaAmbitos = fabricaAmbitos; this.opciones = opciones.Value;
        this.proveedorTiempo = proveedorTiempo; this.registrador = registrador;
    }

    protected override async Task ExecuteAsync(CancellationToken tokenDetencion)
    {
        while (!tokenDetencion.IsCancellationRequested)
        {
            if (opciones.Habilitada) await MantenerTodosLosInquilinosAsync(tokenDetencion);
            await Task.Delay(TimeSpan.FromSeconds(opciones.SegundosMantenimiento), tokenDetencion);
        }
    }

    private async Task MantenerTodosLosInquilinosAsync(CancellationToken tokenCancelacion)
    {
        using var ambito = fabricaAmbitos.CreateScope();
        var maestro = ambito.ServiceProvider.GetRequiredService<MasterDbContext>();
        var inquilinos = await maestro.Tenants.AsNoTracking().Select(x => new { x.Id, x.ConnectionString }).ToListAsync(tokenCancelacion);
        foreach (var inquilino in inquilinos)
        {
            try
            {
                await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(inquilino.ConnectionString).Options);
                var migraciones = await db.Database.GetAppliedMigrationsAsync(tokenCancelacion);
                if (!migraciones.Contains(MigracionImpresionDistribuida, StringComparer.Ordinal))
                {
                    registrador.LogDebug("Se omite el mantenimiento del inquilino {IdInquilino}: aún no tiene la migración de impresión distribuida.", inquilino.Id);
                    continue;
                }
                await MantenerInquilinoAsync(db, tokenCancelacion);
            }
            catch (Exception exception)
            {
                registrador.LogError(exception, "Falló el mantenimiento de impresión para el inquilino {IdInquilino}.", inquilino.Id);
            }
        }
    }

    private async Task MantenerInquilinoAsync(AppDbContext db, CancellationToken tokenCancelacion)
    {
        var ahora = proveedorTiempo.GetUtcNow().UtcDateTime;
        await db.TrabajosImpresion.Where(x => x.VenceEn <= ahora
                && (x.Estado == EstadoTrabajoImpresion.Pendiente || x.Estado == EstadoTrabajoImpresion.ReintentoProgramado))
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.Estado, EstadoTrabajoImpresion.Vencido)
                .SetProperty(x => x.UltimoCodigoError, "TRABAJO_IMPRESION_VENCIDO"), tokenCancelacion);

        var abandonados = await db.TrabajosImpresion.Where(x => x.ReservaVenceEn < ahora
                && (x.Estado == EstadoTrabajoImpresion.Reservado || x.Estado == EstadoTrabajoImpresion.Enviando))
            .ToListAsync(tokenCancelacion);
        foreach (var trabajo in abandonados)
        {
            var estabaEnviando = trabajo.Estado == EstadoTrabajoImpresion.Enviando;
            trabajo.Estado = estabaEnviando ? EstadoTrabajoImpresion.RequiereAtencion
                : trabajo.VenceEn <= ahora ? EstadoTrabajoImpresion.Vencido : EstadoTrabajoImpresion.ReintentoProgramado;
            trabajo.DisponibleEn = ahora; trabajo.ReservaVenceEn = null;
            trabajo.UltimoCodigoError = estabaEnviando ? "RESERVA_VENCIDA_DESPUES_ENVIO" : "RESERVA_VENCIDA_ANTES_ENVIO";
        }
        if (abandonados.Count > 0) await db.SaveChangesAsync(tokenCancelacion);

        var limiteRetencion = ahora.AddDays(-opciones.DiasRetencionContenido);
        await db.TrabajosImpresion.Where(x => x.CreadoEn < limiteRetencion && x.ContenidoJson != "{}")
            .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.ContenidoJson, "{}"), tokenCancelacion);
    }
}
