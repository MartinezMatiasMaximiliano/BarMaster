using BackEndAPI.Models.Impresion;
using BackEndAPI.Impresion.Identidad;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Data;

namespace BackEndAPI.Impresion.Estaciones;

public sealed class ServicioEstacionImpresion : IServicioEstacionImpresion
{
    private readonly ICurrentDbContext contextoDbActual;
    private readonly IIdentidadSolicitudImpresion identidad;
    private readonly TimeProvider proveedorTiempo;

    public ServicioEstacionImpresion(
        ICurrentDbContext contextoDbActual,
        IIdentidadSolicitudImpresion identidad,
        TimeProvider proveedorTiempo)
    {
        this.contextoDbActual = contextoDbActual;
        this.identidad = identidad;
        this.proveedorTiempo = proveedorTiempo;
    }

    public async Task<EstacionImpresionRespuesta> RegistrarAsync(
        RegistrarEstacionImpresionSolicitud solicitud,
        CancellationToken tokenCancelacion)
    {
        var nombre = solicitud.Nombre.Trim();
        if (nombre.Length < 2)
            throw new ExcepcionEstacionImpresion("NOMBRE_ESTACION_INVALIDO", "El nombre de estación es inválido.", StatusCodes.Status400BadRequest);

        var db = contextoDbActual.Db;
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, tokenCancelacion);

        var estacion = await db.EstacionesImpresion.SingleOrDefaultAsync(
            x => x.IdSucursal == identidad.IdSucursal && x.IdInstalacionCliente == solicitud.IdInstalacionCliente,
            tokenCancelacion);

        var esNueva = false;
        if (estacion is null)
        {
            esNueva = true;
            estacion = new EstacionImpresion
            {
                Id = Guid.NewGuid(),
                IdSucursal = identidad.IdSucursal,
                IdInstalacionCliente = solicitud.IdInstalacionCliente,
                Nombre = nombre,
                Habilitada = true,
                CreadoEn = AhoraUtc,
                VistaPorUltimaVezEn = AhoraUtc
            };
            db.EstacionesImpresion.Add(estacion);
        }
        else
        {
            estacion.Nombre = nombre;
            estacion.VistaPorUltimaVezEn = AhoraUtc;
        }

        try
        {
            await db.SaveChangesAsync(tokenCancelacion);
            await transaction.CommitAsync(tokenCancelacion);
        }
        catch (DbUpdateException excepcion) when (esNueva && EsViolacionUnicidad(excepcion))
        {
            await transaction.RollbackAsync(tokenCancelacion);
            db.Entry(estacion).State = EntityState.Detached;
            estacion = await db.EstacionesImpresion.SingleAsync(
                x => x.IdSucursal == identidad.IdSucursal && x.IdInstalacionCliente == solicitud.IdInstalacionCliente,
                tokenCancelacion);
            estacion.Nombre = nombre;
            estacion.VistaPorUltimaVezEn = AhoraUtc;
            await db.SaveChangesAsync(tokenCancelacion);
        }
        return Mapear(estacion);
    }

    public async Task<EstacionImpresionRespuesta?> ObtenerActualAsync(Guid idInstalacionCliente, CancellationToken tokenCancelacion)
    {
        var estacion = await contextoDbActual.Db.EstacionesImpresion.AsNoTracking().SingleOrDefaultAsync(
            x => x.IdSucursal == identidad.IdSucursal && x.IdInstalacionCliente == idInstalacionCliente,
            tokenCancelacion);
        return estacion is null ? null : Mapear(estacion);
    }

    public async Task<EstacionImpresionRespuesta> RegistrarLatidoAsync(Guid idEstacion, CancellationToken tokenCancelacion)
    {
        AsegurarOperacionEstacion(idEstacion);
        var estacion = await ObtenerEstacionPropiaAsync(idEstacion, tokenCancelacion);
        AsegurarHabilitada(estacion);
        estacion.VistaPorUltimaVezEn = AhoraUtc;
        await contextoDbActual.Db.SaveChangesAsync(tokenCancelacion);
        return Mapear(estacion);
    }

    public async Task<EstacionImpresionRespuesta> EstablecerHabilitadaAsync(Guid idEstacion, bool habilitada, CancellationToken tokenCancelacion)
    {
        var estacion = await ObtenerEstacionPropiaAsync(idEstacion, tokenCancelacion);
        estacion.Habilitada = habilitada;
        estacion.RevocadaEn = habilitada ? null : AhoraUtc;
        await contextoDbActual.Db.SaveChangesAsync(tokenCancelacion);
        return Mapear(estacion);
    }

    public async Task<bool> PuedeUsarAsync(Guid idEstacion, CancellationToken tokenCancelacion) =>
        await contextoDbActual.Db.EstacionesImpresion.AsNoTracking().AnyAsync(
            x => x.Id == idEstacion && x.IdSucursal == identidad.IdSucursal && x.Habilitada && x.RevocadaEn == null,
            tokenCancelacion);

    private async Task<EstacionImpresion> ObtenerEstacionPropiaAsync(Guid idEstacion, CancellationToken tokenCancelacion) =>
        await contextoDbActual.Db.EstacionesImpresion.SingleOrDefaultAsync(
            x => x.Id == idEstacion && x.IdSucursal == identidad.IdSucursal,
            tokenCancelacion)
        ?? throw new ExcepcionEstacionImpresion("ESTACION_NO_ENCONTRADA", "La estación no existe en esta sucursal.", StatusCodes.Status404NotFound);

    private static void AsegurarHabilitada(EstacionImpresion estacion)
    {
        if (!estacion.Habilitada || estacion.RevocadaEn is not null)
            throw new ExcepcionEstacionImpresion("ESTACION_DESHABILITADA", "La estación está deshabilitada.", StatusCodes.Status403Forbidden);
    }

    private void AsegurarOperacionEstacion(Guid idEstacion)
    {
        if (identidad.TipoAutenticacion == "estacion_impresion" && identidad.IdEstacion != idEstacion)
            throw new ExcepcionEstacionImpresion("ESTACION_NO_AUTORIZADA", "Este equipo no puede operar otra estación.", StatusCodes.Status403Forbidden);
    }

    private DateTime AhoraUtc => proveedorTiempo.GetUtcNow().UtcDateTime;

    private static bool EsViolacionUnicidad(DbUpdateException excepcion) =>
        excepcion.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation };

    private static EstacionImpresionRespuesta Mapear(EstacionImpresion estacion) => new(
        estacion.Id, estacion.IdInstalacionCliente, estacion.Nombre, estacion.Habilitada,
        estacion.CreadoEn, estacion.VistaPorUltimaVezEn, estacion.RevocadaEn);

}
