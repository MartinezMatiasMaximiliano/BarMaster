using BackEndAPI.Models.Impresion;
using BackEndAPI.Data;
using BackEndAPI.Impresion.Identidad;
using BackEndAPI.Impresion.Estaciones;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BackEndAPI.Impresion.Dispositivos;

public sealed class ServicioImpresora : IServicioImpresora
{
    private readonly ICurrentDbContext contextoDbActual;
    private readonly IIdentidadSolicitudImpresion identidad;
    private readonly OpcionesImpresionDistribuida opciones;
    private readonly TimeProvider proveedorTiempo;

    public ServicioImpresora(
        ICurrentDbContext contextoDbActual,
        IIdentidadSolicitudImpresion identidad,
        IOptions<OpcionesImpresionDistribuida> opciones,
        TimeProvider proveedorTiempo)
    {
        this.contextoDbActual = contextoDbActual;
        this.identidad = identidad;
        this.opciones = opciones.Value;
        this.proveedorTiempo = proveedorTiempo;
    }

    public async Task<IReadOnlyList<ImpresoraRespuesta>> SincronizarAsync(
        Guid idEstacion,
        SincronizarInventarioImpresorasSolicitud solicitud,
        CancellationToken tokenCancelacion)
    {
        AsegurarIdentidadEstacion(idEstacion);
        var db = contextoDbActual.Db;
        var estacion = await ObtenerEstacionPropiaAsync(db, idEstacion, tokenCancelacion);
        var ahora = AhoraUtc;
        var detectadas = solicitud.Impresoras
            .Select(x => new { Nombre = x.NombreSistema.Trim(), x.Estado })
            .Where(x => x.Nombre.Length > 0)
            .GroupBy(x => NormalizarNombre(x.Nombre), StringComparer.Ordinal)
            .Select(x => x.First())
            .ToDictionary(x => NormalizarNombre(x.Nombre), StringComparer.Ordinal);

        var existentes = await db.Impresoras
            .Include(x => x.Reglas)
            .Where(x => x.IdEstacion == idEstacion)
            .ToListAsync(tokenCancelacion);
        foreach (var impresora in existentes)
        {
            impresora.Presente = false;
            impresora.ActualizadoEn = ahora;
        }

        foreach (var elemento in detectadas)
        {
            var impresora = existentes.FirstOrDefault(x => x.NombreSistemaNormalizado == elemento.Key);
            if (impresora is null)
            {
                impresora = new Impresora
                {
                    IdEstacion = idEstacion,
                    NombreSistema = elemento.Value.Nombre,
                    NombreSistemaNormalizado = elemento.Key,
                    NombreVisible = elemento.Value.Nombre,
                    VistaPorUltimaVezEn = ahora,
                    ActualizadoEn = ahora
                };
                db.Impresoras.Add(impresora);
                existentes.Add(impresora);
            }
            else
            {
                impresora.NombreSistema = elemento.Value.Nombre;
                impresora.VistaPorUltimaVezEn = ahora;
                impresora.ActualizadoEn = ahora;
            }
            // BarMaster usa las colas descubiertas como ticketeras ESC/POS. El usuario final
            // no debe decidir el protocolo de impresión desde la pantalla de configuración.
            impresora.Formato = FormatoImpresion.Crudo;
            impresora.Presente = true;
            impresora.UltimoEstado = string.IsNullOrWhiteSpace(elemento.Value.Estado) ? null : elemento.Value.Estado.Trim();
        }

        estacion.VistaPorUltimaVezEn = ahora;
        estacion.UltimaVersionAgente = solicitud.VersionAgente.Trim();
        estacion.UltimaVersionQz = solicitud.VersionQz.Trim();
        await db.SaveChangesAsync(tokenCancelacion);
        return existentes.OrderBy(x => x.NombreVisible).Select(x => Mapear(x, estacion, ahora)).ToList();
    }

    public async Task<IReadOnlyList<ImpresoraRespuesta>> ObtenerParaEstacionAsync(Guid idEstacion, CancellationToken tokenCancelacion)
    {
        AsegurarIdentidadEstacion(idEstacion);
        var estacion = await ObtenerEstacionPropiaAsync(contextoDbActual.Db, idEstacion, tokenCancelacion);
        var impresoras = await contextoDbActual.Db.Impresoras.AsNoTracking()
            .Include(x => x.Reglas)
            .Where(x => x.IdEstacion == idEstacion)
            .OrderBy(x => x.NombreVisible)
            .ToListAsync(tokenCancelacion);
        return impresoras.Select(x => Mapear(x, estacion, AhoraUtc)).ToList();
    }

    public async Task<IReadOnlyList<ImpresoraRespuesta>> ObtenerParaSucursalAsync(CancellationToken tokenCancelacion)
    {
        var ahora = AhoraUtc;
        var impresoras = await contextoDbActual.Db.Impresoras.AsNoTracking()
            .Include(x => x.Estacion)
            .Include(x => x.Reglas)
            .Where(x => x.Estacion.IdSucursal == identidad.IdSucursal)
            .OrderBy(x => x.Estacion.Nombre).ThenBy(x => x.NombreVisible)
            .ToListAsync(tokenCancelacion);
        return impresoras.Select(x => Mapear(x, x.Estacion, ahora)).ToList();
    }

    public async Task<ImpresoraRespuesta> ActualizarAsync(
        Guid idImpresora,
        ActualizarImpresoraSolicitud solicitud,
        CancellationToken tokenCancelacion)
    {
        if (solicitud.AnchoPapelMm is not (58 or 80))
            throw OpcionInvalida();
        var impresora = await contextoDbActual.Db.Impresoras
            .Include(x => x.Estacion)
            .Include(x => x.Reglas)
            .SingleOrDefaultAsync(x => x.Id == idImpresora && x.Estacion.IdSucursal == identidad.IdSucursal, tokenCancelacion)
            ?? throw new ExcepcionEstacionImpresion("IMPRESORA_NO_ENCONTRADA", "La impresora no existe en esta sucursal.", StatusCodes.Status404NotFound);
        await ProteccionConfiguracionImpresion.AsegurarSinCajaActivaAsync(
            contextoDbActual.Db, identidad.IdSucursal, tokenCancelacion);
        impresora.NombreVisible = solicitud.NombreVisible.Trim();
        impresora.Formato = FormatoImpresion.Crudo;
        impresora.AnchoPapelMm = solicitud.AnchoPapelMm;
        impresora.Codificacion = solicitud.Codificacion.Trim().ToUpperInvariant();
        impresora.Habilitada = solicitud.Habilitada;
        impresora.ActualizadoEn = AhoraUtc;
        await contextoDbActual.Db.SaveChangesAsync(tokenCancelacion);
        return Mapear(impresora, impresora.Estacion, AhoraUtc);
    }

    public async Task EliminarAsync(Guid idImpresora, CancellationToken tokenCancelacion)
    {
        var db = contextoDbActual.Db;
        var impresora = await db.Impresoras.SingleOrDefaultAsync(
            x => x.Id == idImpresora && x.Estacion.IdSucursal == identidad.IdSucursal,
            tokenCancelacion)
            ?? throw new ExcepcionEstacionImpresion("IMPRESORA_NO_ENCONTRADA", "La impresora no existe en esta sucursal.", StatusCodes.Status404NotFound);
        await ProteccionConfiguracionImpresion.AsegurarSinCajaActivaAsync(
            db, identidad.IdSucursal, tokenCancelacion);
        if (await db.ReglasImpresion.AnyAsync(x => x.IdImpresora == idImpresora, tokenCancelacion))
            throw new ExcepcionEstacionImpresion(
                "IMPRESORA_CON_REGLAS",
                "La impresora tiene reglas asociadas. Eliminá primero esas reglas para poder quitarla.",
                StatusCodes.Status409Conflict);

        db.Impresoras.Remove(impresora);
        await db.SaveChangesAsync(tokenCancelacion);
    }

    private async Task<EstacionImpresion> ObtenerEstacionPropiaAsync(AppDbContext db, Guid idEstacion, CancellationToken tokenCancelacion)
    {
        var estacion = await db.EstacionesImpresion.SingleOrDefaultAsync(
            x => x.Id == idEstacion && x.IdSucursal == identidad.IdSucursal,
            tokenCancelacion);
        if (estacion is null)
            throw new ExcepcionEstacionImpresion("ESTACION_NO_ENCONTRADA", "La estación no existe en esta sucursal.", StatusCodes.Status404NotFound);
        if (!estacion.Habilitada || estacion.RevocadaEn is not null)
            throw new ExcepcionEstacionImpresion("ESTACION_DESHABILITADA", "La estación está deshabilitada.", StatusCodes.Status403Forbidden);
        return estacion;
    }

    private void AsegurarIdentidadEstacion(Guid idEstacion)
    {
        if (identidad.TipoAutenticacion != "estacion_impresion" || identidad.IdEstacion != idEstacion)
            throw new ExcepcionEstacionImpresion("ESTACION_NO_AUTORIZADA", "Este equipo no puede modificar otra estación.", StatusCodes.Status403Forbidden);
    }

    private ImpresoraRespuesta Mapear(Impresora impresora, EstacionImpresion estacion, DateTime ahora) => new(
        impresora.Id, impresora.IdEstacion, estacion.Nombre, impresora.NombreSistema, impresora.NombreVisible,
        impresora.AnchoPapelMm, impresora.Codificacion, impresora.Habilitada, impresora.Presente,
        impresora.VistaPorUltimaVezEn, impresora.UltimoEstado,
        estacion.Habilitada && estacion.RevocadaEn is null && estacion.VistaPorUltimaVezEn >= ahora.AddSeconds(-opciones.SegundosHastaFueraDeLinea),
        impresora.Reglas.Count);

    private static string NormalizarNombre(string nombre) => nombre.Trim().ToUpperInvariant();
    private static ExcepcionEstacionImpresion OpcionInvalida() =>
        new("OPCION_IMPRESION_INVALIDA", "La configuración de impresora es inválida.", StatusCodes.Status400BadRequest);
    private DateTime AhoraUtc => proveedorTiempo.GetUtcNow().UtcDateTime;
}
