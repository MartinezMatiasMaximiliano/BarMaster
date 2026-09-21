using BackEndAPI.Models.Impresion;
using BackEndAPI.Impresion.Identidad;
using BackEndAPI.Impresion.Estaciones;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BackEndAPI.Impresion.Reglas;

public sealed class ServicioReglaImpresion : IServicioReglaImpresion
{
    private readonly ICurrentDbContext contextoDbActual;
    private readonly IIdentidadSolicitudImpresion identidad;
    private readonly OpcionesImpresionDistribuida opciones;
    private readonly TimeProvider proveedorTiempo;

    public ServicioReglaImpresion(
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

    public async Task<IReadOnlyList<ReglaImpresionRespuesta>> ObtenerTodasAsync(CancellationToken tokenCancelacion) =>
        (await ConsultaBase().AsNoTracking()
            .OrderBy(x => x.TipoSalida).ThenBy(x => x.Momento).ThenBy(x => x.Impresora.NombreVisible)
            .ToListAsync(tokenCancelacion))
        .Select(Mapear).ToList();

    public async Task<ReglaImpresionRespuesta> GuardarAsync(
        GuardarReglaImpresionSolicitud solicitud,
        CancellationToken tokenCancelacion)
    {
        AsegurarHabilitada();
        if (solicitud.IdImpresora == Guid.Empty
            || !Enum.IsDefined(solicitud.TipoSalida)
            || !Enum.IsDefined(solicitud.Momento))
            throw ReglaInvalida();

        var db = contextoDbActual.Db;
        if (!EsCompatible(solicitud.TipoSalida, solicitud.Momento))
        {
            var soloDeshabilitaAnterior = solicitud.Id.HasValue && !solicitud.Habilitada
                && await db.ReglasImpresion.AnyAsync(x => x.Id == solicitud.Id && x.IdSucursal == identidad.IdSucursal
                    && x.IdImpresora == solicitud.IdImpresora && x.TipoSalida == solicitud.TipoSalida
                    && x.Momento == solicitud.Momento, tokenCancelacion);
            if (!soloDeshabilitaAnterior)
                throw new ExcepcionEstacionImpresion("REGLA_IMPRESION_NO_COMPATIBLE", "Solo se admite comanda al cargar productos y ticket al imprimir preticket o cobrar productos.", StatusCodes.Status400BadRequest);
        }
        var existeImpresora = await db.Impresoras.AnyAsync(x =>
            x.Id == solicitud.IdImpresora && x.EliminadaEn == null && x.Estacion.IdSucursal == identidad.IdSucursal,
            tokenCancelacion);
        if (!existeImpresora)
            throw new ExcepcionEstacionImpresion("IMPRESORA_REGLA_INVALIDA", "La impresora no pertenece a esta sucursal.", StatusCodes.Status400BadRequest);

        var duplicada = await db.ReglasImpresion.AnyAsync(x =>
            x.IdSucursal == identidad.IdSucursal
            && x.IdImpresora == solicitud.IdImpresora
            && x.TipoSalida == solicitud.TipoSalida
            && x.Momento == solicitud.Momento
            && (!solicitud.Id.HasValue || x.Id != solicitud.Id), tokenCancelacion);
        if (duplicada)
            throw new ExcepcionEstacionImpresion("REGLA_IMPRESION_DUPLICADA", "Ya existe esa regla para la impresora.", StatusCodes.Status409Conflict);

        ReglaImpresion regla;
        if (solicitud.Id.HasValue)
        {
            regla = await db.ReglasImpresion.SingleOrDefaultAsync(
                x => x.Id == solicitud.Id && x.IdSucursal == identidad.IdSucursal,
                tokenCancelacion)
                ?? throw new ExcepcionEstacionImpresion("REGLA_IMPRESION_NO_ENCONTRADA", "La regla de impresión no existe.", StatusCodes.Status404NotFound);
        }
        else
        {
            regla = new ReglaImpresion { IdSucursal = identidad.IdSucursal, CreadoEn = AhoraUtc };
            db.ReglasImpresion.Add(regla);
        }

        regla.IdImpresora = solicitud.IdImpresora;
        regla.TipoSalida = solicitud.TipoSalida;
        regla.Momento = solicitud.Momento;
        regla.Habilitada = solicitud.Habilitada;
        regla.ActualizadoEn = AhoraUtc;
        await db.SaveChangesAsync(tokenCancelacion);

        return Mapear(await ConsultaBase().AsNoTracking().SingleAsync(x => x.Id == regla.Id, tokenCancelacion));
    }

    public async Task EliminarAsync(Guid idRegla, CancellationToken tokenCancelacion)
    {
        var regla = await contextoDbActual.Db.ReglasImpresion.SingleOrDefaultAsync(
            x => x.Id == idRegla && x.IdSucursal == identidad.IdSucursal,
            tokenCancelacion)
            ?? throw new ExcepcionEstacionImpresion("REGLA_IMPRESION_NO_ENCONTRADA", "La regla de impresión no existe.", StatusCodes.Status404NotFound);
        await ProteccionConfiguracionImpresion.AsegurarSinCajaActivaAsync(
            contextoDbActual.Db, identidad.IdSucursal, tokenCancelacion);
        contextoDbActual.Db.ReglasImpresion.Remove(regla);
        await contextoDbActual.Db.SaveChangesAsync(tokenCancelacion);
    }

    public async Task<ValidacionConfiguracionImpresionRespuesta> ValidarAsync(CancellationToken tokenCancelacion)
    {
        var problemas = new List<ProblemaConfiguracionImpresion>();
        var reglas = await ConsultaBase().AsNoTracking().Where(x => x.Habilitada).ToListAsync(tokenCancelacion);
        foreach (var regla in reglas)
        {
            if (!EsCompatible(regla.TipoSalida, regla.Momento))
                problemas.Add(new("REGLA_IMPRESION_NO_COMPATIBLE", "Esta regla no es compatible. Deshabilitala o eliminala.", regla.Id));
            if (!regla.Impresora.Habilitada || !regla.Impresora.Presente)
                problemas.Add(new("IMPRESORA_NO_DISPONIBLE", $"{regla.Impresora.NombreVisible} no está disponible.", regla.IdImpresora));
            if (!EstacionEnLinea(regla.Impresora.Estacion))
                problemas.Add(new("ESTACION_DESCONECTADA", $"{regla.Impresora.Estacion.Nombre} está desconectada.", regla.Impresora.IdEstacion));
        }
        return new(problemas.Count == 0, problemas);
    }

    public async Task<IReadOnlyList<ReglaImpresion>> ResolverAsync(
        TipoDocumentoImpresion tipoDocumento,
        MomentoImpresion momento,
        CancellationToken tokenCancelacion)
    {
        AsegurarHabilitada();
        var tipoSalida = tipoDocumento == TipoDocumentoImpresion.Comanda
            ? TipoSalidaImpresion.Comanda
            : TipoSalidaImpresion.Ticket;
        if (tipoDocumento is not (TipoDocumentoImpresion.Comanda or TipoDocumentoImpresion.Preticket or TipoDocumentoImpresion.ComprobantePago)
            || !EsCompatible(tipoSalida, momento)) return [];
        return await ConsultaBase()
            .Where(x => x.Habilitada && x.Impresora.EliminadaEn == null && x.TipoSalida == tipoSalida && x.Momento == momento)
            .OrderBy(x => x.CreadoEn)
            .ToListAsync(tokenCancelacion);
    }

    private IQueryable<ReglaImpresion> ConsultaBase() => contextoDbActual.Db.ReglasImpresion
        .Include(x => x.Impresora).ThenInclude(x => x.Estacion)
        .Where(x => x.IdSucursal == identidad.IdSucursal);

    private ReglaImpresionRespuesta Mapear(ReglaImpresion regla) => new(
        regla.Id, regla.IdImpresora, regla.Impresora.NombreVisible,
        regla.Impresora.IdEstacion, regla.Impresora.Estacion.Nombre,
        regla.TipoSalida, regla.Momento, regla.Habilitada,
        regla.Impresora.Habilitada && regla.Impresora.Presente && EstacionEnLinea(regla.Impresora.Estacion),
        regla.ActualizadoEn, EsCompatible(regla.TipoSalida, regla.Momento));

    private static bool EsCompatible(TipoSalidaImpresion tipo, MomentoImpresion momento) =>
        (tipo == TipoSalidaImpresion.Comanda && momento == MomentoImpresion.AlCargarProductosMesa)
        || (tipo == TipoSalidaImpresion.Ticket && momento is MomentoImpresion.AlGenerarPreticket or MomentoImpresion.AlCobrarProductosSinFacturar);

    private bool EstacionEnLinea(EstacionImpresion estacion) => estacion.Habilitada && estacion.RevocadaEn is null
        && estacion.VistaPorUltimaVezEn >= AhoraUtc.AddSeconds(-opciones.SegundosHastaFueraDeLinea);

    private void AsegurarHabilitada()
    {
        if (!opciones.Habilitada)
            throw new ExcepcionEstacionImpresion("IMPRESION_DISTRIBUIDA_DESHABILITADA", "La impresión distribuida no está habilitada.", StatusCodes.Status503ServiceUnavailable);
    }

    private static ExcepcionEstacionImpresion ReglaInvalida() =>
        new("REGLA_IMPRESION_INVALIDA", "La regla de impresión es inválida.", StatusCodes.Status400BadRequest);
    private DateTime AhoraUtc => proveedorTiempo.GetUtcNow().UtcDateTime;
}
