using BackEndAPI.Models.Impresion;
using BackEndAPI.Impresion.Identidad;
using BackEndAPI.Impresion.Notificaciones;
using BackEndAPI.Impresion.Reglas;
using BackEndAPI.Impresion.Estaciones;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Npgsql;
using System.Text.Json;

namespace BackEndAPI.Impresion.Trabajos;

public sealed class ServicioTrabajoImpresion : IServicioTrabajoImpresion
{
    private readonly ICurrentDbContext contextoDbActual;
    private readonly IIdentidadSolicitudImpresion identidad;
    private readonly IServicioReglaImpresion servicioRegla;
    private readonly INotificadorImpresion notificador;
    private readonly OpcionesImpresionDistribuida opciones;
    private readonly TimeProvider proveedorTiempo;

    public ServicioTrabajoImpresion(
        ICurrentDbContext contextoDbActual,
        IIdentidadSolicitudImpresion identidad,
        IServicioReglaImpresion servicioRegla,
        INotificadorImpresion notificador,
        IOptions<OpcionesImpresionDistribuida> opciones,
        TimeProvider proveedorTiempo)
    {
        this.contextoDbActual = contextoDbActual;
        this.identidad = identidad;
        this.servicioRegla = servicioRegla;
        this.notificador = notificador;
        this.opciones = opciones.Value;
        this.proveedorTiempo = proveedorTiempo;
    }

    public async Task<CrearSolicitudImpresionRespuesta> CrearEnrutadosAsync(
        CrearTrabajosImpresionEnrutadosComando comando,
        CancellationToken tokenCancelacion)
    {
        AsegurarHabilitada();
        if (string.IsNullOrWhiteSpace(comando.ContenidoJson)
            || comando.VersionEsquema <= 0 || comando.VersionPlantilla <= 0
            || string.IsNullOrWhiteSpace(comando.ClaveIdempotenciaBase))
            throw TrabajoInvalido();

        var reglas = await servicioRegla.ResolverAsync(comando.TipoDocumento, comando.Momento, tokenCancelacion);
        if (reglas.Count == 0)
            throw new ExcepcionEstacionImpresion("REGLA_IMPRESION_NO_CONFIGURADA", "No hay una regla configurada para esta impresión.", StatusCodes.Status409Conflict);
        var ahora = AhoraUtc;
        var db = contextoDbActual.Db;
        var claves = reglas.ToDictionary(
            x => x.Id,
            x => $"{comando.ClaveIdempotenciaBase}:{x.Id:N}");
        var existentes = await TrabajosConDestino().Where(x =>
                x.IdSucursal == identidad.IdSucursal && claves.Values.Contains(x.ClaveIdempotencia))
            .ToListAsync(tokenCancelacion);
        var trabajosAgregados = new List<TrabajoImpresion>();

        foreach (var regla in reglas.Where(x => existentes.All(y => y.IdRegla != x.Id)))
        {
            var impresora = regla.Impresora;
            if (impresora.EliminadaEn != null || !impresora.Habilitada || !impresora.Estacion.Habilitada || impresora.Estacion.RevocadaEn is not null)
                throw new ExcepcionEstacionImpresion("DESTINO_IMPRESION_DESHABILITADO", "Una impresora de la regla está deshabilitada.", StatusCodes.Status409Conflict);
            var trabajo = new TrabajoImpresion
            {
                IdSolicitud = comando.IdSolicitud,
                IdSucursal = identidad.IdSucursal,
                IdEstacion = impresora.IdEstacion,
                IdRegla = regla.Id,
                IdPersonaSolicitante = comando.IdPersonaSolicitante,
                TipoDocumento = comando.TipoDocumento,
                VersionEsquema = comando.VersionEsquema,
                VersionPlantilla = comando.VersionPlantilla,
                ContenidoJson = comando.ContenidoJson,
                NombreSistemaImpresora = impresora.NombreSistema,
                NombreVisibleImpresora = impresora.NombreVisible,
                Formato = FormatoImpresion.Crudo,
                AnchoPapelMm = impresora.AnchoPapelMm,
                Codificacion = impresora.Codificacion,
                Copias = 1,
                Estado = EstadoTrabajoImpresion.Pendiente,
                ClaveIdempotencia = claves[regla.Id],
                TipoEntidadOrigen = comando.TipoEntidadOrigen,
                IdEntidadOrigen = comando.IdEntidadOrigen,
                CreadoEn = ahora,
                DisponibleEn = ahora,
                VenceEn = ahora.AddMinutes(30)
            };
            trabajosAgregados.Add(trabajo);
            db.TrabajosImpresion.Add(trabajo);
        }

        try
        {
            await db.SaveChangesAsync(tokenCancelacion);
        }
        catch (DbUpdateException exception) when (EsViolacionUnicidad(exception))
        {
            foreach (var trabajo in trabajosAgregados)
            {
                var entrada = db.Entry(trabajo);
                if (entrada.State == EntityState.Added)
                    entrada.State = EntityState.Detached;
            }
        }

        var trabajos = await TrabajosConDestino().AsNoTracking()
            .Where(x => x.IdSucursal == identidad.IdSucursal && claves.Values.Contains(x.ClaveIdempotencia))
            .OrderBy(x => x.CreadoEn)
            .ToListAsync(tokenCancelacion);
        if (trabajos.Count != reglas.Count)
            throw new InvalidOperationException("No se pudieron recuperar todos los trabajos idempotentes creados.");
        var respuesta = new CrearSolicitudImpresionRespuesta(comando.IdSolicitud, trabajos.Select(Mapear).ToList());
        if (comando.NotificarInmediatamente) await NotificarAsync(respuesta, tokenCancelacion);
        return respuesta;
    }

    public Task NotificarAsync(CrearSolicitudImpresionRespuesta respuesta, CancellationToken tokenCancelacion) =>
        notificador.TrabajosDisponiblesAsync(respuesta.Trabajos.Select(x => x.IdEstacion).Distinct(), tokenCancelacion);

    public async Task<ResumenTrabajoImpresionRespuesta> CrearPruebaImpresoraAsync(Guid idImpresora, CancellationToken tokenCancelacion)
    {
        AsegurarHabilitada();
        var impresora = await contextoDbActual.Db.Impresoras.Include(x => x.Estacion).SingleOrDefaultAsync(
            x => x.Id == idImpresora && x.Estacion.IdSucursal == identidad.IdSucursal, tokenCancelacion)
            ?? throw new ExcepcionEstacionImpresion("IMPRESORA_NO_ENCONTRADA", "La impresora no existe en esta sucursal.", StatusCodes.Status404NotFound);
        if (impresora.EliminadaEn != null || !impresora.Habilitada || !impresora.Estacion.Habilitada || impresora.Estacion.RevocadaEn is not null)
            throw new ExcepcionEstacionImpresion("DESTINO_IMPRESION_DESHABILITADO", "La impresora está deshabilitada.", StatusCodes.Status409Conflict);
        var ahora = AhoraUtc;
        var contenido = JsonSerializer.Serialize(new
        {
            versionEsquema = 1, nombreSucursal = "BarMaster", nombreMesa = "PRUEBA REMOTA",
            solicitadoEnUtc = ahora, lineas = new[] { new { cantidad = 1, descripcion = "Configuración correcta", precioUnitario = 0m, notas = (string?)null } },
            total = 0m, leyendaNoFiscal = "PRUEBA DE IMPRESION"
        });
        var trabajo = new TrabajoImpresion
        {
            IdSolicitud = Guid.NewGuid(), IdSucursal = identidad.IdSucursal, IdEstacion = impresora.IdEstacion,
            IdPersonaSolicitante = identidad.IdPersona,
            TipoDocumento = TipoDocumentoImpresion.Preticket, ContenidoJson = contenido,
            NombreSistemaImpresora = impresora.NombreSistema, NombreVisibleImpresora = impresora.NombreVisible,
            Formato = FormatoImpresion.Crudo,
            AnchoPapelMm = impresora.AnchoPapelMm, Codificacion = impresora.Codificacion,
            Copias = 1, Estado = EstadoTrabajoImpresion.Pendiente,
            ClaveIdempotencia = $"prueba:{Guid.NewGuid():N}", TipoEntidadOrigen = "PruebaImpresora", IdEntidadOrigen = impresora.Id.ToString("N"),
            CreadoEn = ahora, DisponibleEn = ahora, VenceEn = ahora.AddMinutes(10), Estacion = impresora.Estacion
        };
        contextoDbActual.Db.TrabajosImpresion.Add(trabajo);
        await contextoDbActual.Db.SaveChangesAsync(tokenCancelacion);
        await notificador.TrabajosDisponiblesAsync([trabajo.IdEstacion], tokenCancelacion);
        return Mapear(trabajo);
    }

    public async Task<IReadOnlyList<TrabajoImpresionReservadoRespuesta>> ReservarAsync(int maximoTrabajos, CancellationToken tokenCancelacion)
    {
        AsegurarHabilitada();
        var idEstacion = await RequerirIdEstacionActivaAsync(tokenCancelacion);
        maximoTrabajos = Math.Clamp(maximoTrabajos, 1, opciones.TamanoLoteReserva);
        await VencerTrabajosEnColaAsync(idEstacion, tokenCancelacion);
        await RecuperarReservasVencidasAsync(idEstacion, tokenCancelacion);
        var resultado = new List<TrabajoImpresionReservadoRespuesta>();
        for (var indice = 0; indice < maximoTrabajos; indice++)
        {
            var reservado = await ReservarUnoAsync(idEstacion, tokenCancelacion);
            if (reservado is null) break;
            resultado.Add(reservado);
        }
        return resultado;
    }

    public async Task MarcarEnviandoAsync(Guid idTrabajo, Guid idReserva, CancellationToken tokenCancelacion)
    {
        var trabajo = await ObtenerTrabajoReservadoAsync(idTrabajo, idReserva, EstadoTrabajoImpresion.Reservado, tokenCancelacion);
        trabajo.Estado = EstadoTrabajoImpresion.Enviando;
        trabajo.EnvioIniciadoEn = AhoraUtc;
        await GuardarReservaAsync(tokenCancelacion);
    }

    public async Task RenovarReservaAsync(Guid idTrabajo, Guid idReserva, CancellationToken tokenCancelacion)
    {
        var idEstacion = await RequerirIdEstacionActivaAsync(tokenCancelacion);
        var trabajo = await contextoDbActual.Db.TrabajosImpresion.SingleOrDefaultAsync(x =>
            x.Id == idTrabajo && x.IdEstacion == idEstacion && x.IdReserva == idReserva
            && x.ReservaVenceEn > AhoraUtc
            && (x.Estado == EstadoTrabajoImpresion.Reservado || x.Estado == EstadoTrabajoImpresion.Enviando), tokenCancelacion)
            ?? throw ReservaInvalida();
        trabajo.ReservaVenceEn = AhoraUtc.AddSeconds(opciones.SegundosReserva);
        await GuardarReservaAsync(tokenCancelacion);
    }

    public async Task MarcarAceptadoPorColaAsync(Guid idTrabajo, Guid idReserva, CancellationToken tokenCancelacion)
    {
        var trabajo = await ObtenerTrabajoReservadoAsync(idTrabajo, idReserva, EstadoTrabajoImpresion.Enviando, tokenCancelacion);
        var ahora = AhoraUtc;
        trabajo.Estado = EstadoTrabajoImpresion.AceptadoPorCola;
        trabajo.AceptadoPorColaEn = ahora;
        trabajo.ReservaVenceEn = null;
        trabajo.UltimoCodigoError = null;
        trabajo.UltimoDetalleError = null;
        await GuardarReservaAsync(tokenCancelacion);
    }

    public async Task MarcarFallidoAsync(Guid idTrabajo, FallarTrabajoImpresionSolicitud solicitud, CancellationToken tokenCancelacion)
    {
        var idEstacion = await RequerirIdEstacionActivaAsync(tokenCancelacion);
        var db = contextoDbActual.Db;
        var trabajo = await db.TrabajosImpresion.SingleOrDefaultAsync(x =>
            x.Id == idTrabajo && x.IdEstacion == idEstacion && x.IdReserva == solicitud.IdReserva
            && x.ReservaVenceEn > AhoraUtc
            && (x.Estado == EstadoTrabajoImpresion.Reservado || x.Estado == EstadoTrabajoImpresion.Enviando), tokenCancelacion)
            ?? throw ReservaInvalida();
        var ahora = AhoraUtc;
        var estabaEnviando = trabajo.Estado == EstadoTrabajoImpresion.Enviando;
        var vencidos = trabajo.VenceEn <= ahora;
        if (vencidos)
            trabajo.Estado = EstadoTrabajoImpresion.Vencido;
        else if (solicitud.Ambiguo || estabaEnviando || !solicitud.Reintentable)
            trabajo.Estado = EstadoTrabajoImpresion.RequiereAtencion;
        else
        {
            trabajo.Estado = EstadoTrabajoImpresion.ReintentoProgramado;
            trabajo.DisponibleEn = ahora.AddSeconds(Math.Min(60, Math.Pow(2, Math.Min(trabajo.CantidadIntentos, (short)5))));
        }
        trabajo.ReservaVenceEn = null;
        trabajo.UltimoCodigoError = solicitud.CodigoError.Trim();
        trabajo.UltimoDetalleError = Truncar(solicitud.DetalleTecnico, 1000);
        await GuardarReservaAsync(tokenCancelacion);
    }

    public async Task<IReadOnlyList<ResumenTrabajoImpresionRespuesta>> ObtenerPorSolicitudAsync(Guid idSolicitud, CancellationToken tokenCancelacion)
    {
        var trabajos = await TrabajosConDestino().AsNoTracking()
            .Where(x => x.IdSucursal == identidad.IdSucursal && x.IdSolicitud == idSolicitud)
            .OrderBy(x => x.CreadoEn)
            .ToListAsync(tokenCancelacion);
        return trabajos.Select(Mapear).ToList();
    }

    public async Task<IReadOnlyList<ResumenTrabajoImpresionRespuesta>> ConsultarAsync(ConsultaTrabajosImpresion consulta, CancellationToken tokenCancelacion)
    {
        var trabajos = TrabajosConDestino().AsNoTracking().Where(x => x.IdSucursal == identidad.IdSucursal);
        if (consulta.Estado.HasValue) trabajos = trabajos.Where(x => x.Estado == consulta.Estado);
        if (consulta.IdEstacion.HasValue) trabajos = trabajos.Where(x => x.IdEstacion == consulta.IdEstacion);
        if (consulta.Desde.HasValue) trabajos = trabajos.Where(x => x.CreadoEn >= consulta.Desde);
        if (consulta.Hasta.HasValue) trabajos = trabajos.Where(x => x.CreadoEn <= consulta.Hasta);
        return (await trabajos.OrderByDescending(x => x.CreadoEn).Take(Math.Clamp(consulta.Limite, 1, 500))
            .ToListAsync(tokenCancelacion)).Select(Mapear).ToList();
    }

    public async Task<ResumenTrabajoImpresionRespuesta> ReintentarAsync(Guid idTrabajo, string motivo, CancellationToken tokenCancelacion)
    {
        var original = await TrabajosConDestino().SingleOrDefaultAsync(
            x => x.Id == idTrabajo && x.IdSucursal == identidad.IdSucursal,
            tokenCancelacion)
            ?? throw TrabajoNoEncontrado();
        if (original.Estado != EstadoTrabajoImpresion.RequiereAtencion)
            throw new ExcepcionEstacionImpresion("TRABAJO_NO_REIMPRIMIBLE", "Este trabajo no necesita reimpresión.", StatusCodes.Status409Conflict);
        if (string.IsNullOrWhiteSpace(original.ContenidoJson)
            || original.ContenidoJson.Trim() == "{}")
            throw new ExcepcionEstacionImpresion("DOCUMENTO_IMPRESION_ELIMINADO", "El contenido de esta impresión fue eliminado por retención. Generá un documento nuevo.", StatusCodes.Status409Conflict);
        var ahora = AhoraUtc;
        var copy = new TrabajoImpresion
        {
            IdSolicitud = Guid.NewGuid(),
            IdSucursal = original.IdSucursal,
            IdEstacion = original.IdEstacion,
            IdRegla = original.IdRegla,
            IdPersonaSolicitante = identidad.IdPersona,
            IdTrabajoReimpreso = original.Id,
            TipoDocumento = original.TipoDocumento,
            VersionEsquema = original.VersionEsquema,
            VersionPlantilla = original.VersionPlantilla,
            ContenidoJson = original.ContenidoJson,
            NombreSistemaImpresora = original.NombreSistemaImpresora,
            NombreVisibleImpresora = original.NombreVisibleImpresora,
            Formato = FormatoImpresion.Crudo,
            AnchoPapelMm = original.AnchoPapelMm,
            Codificacion = original.Codificacion,
            Copias = original.Copias,
            Estado = EstadoTrabajoImpresion.Pendiente,
            ClaveIdempotencia = $"reprint:{original.Id:N}:{Guid.NewGuid():N}",
            TipoEntidadOrigen = original.TipoEntidadOrigen,
            IdEntidadOrigen = original.IdEntidadOrigen,
            CreadoEn = ahora,
            DisponibleEn = ahora,
            VenceEn = ahora.AddMinutes(30)
        };
        copy.Estacion = original.Estacion;
        original.UltimoDetalleError = $"Reimpresión solicitada: {Truncar(motivo, 300)}";
        contextoDbActual.Db.TrabajosImpresion.Add(copy);
        await contextoDbActual.Db.SaveChangesAsync(tokenCancelacion);
        await notificador.TrabajosDisponiblesAsync([copy.IdEstacion], tokenCancelacion);
        return Mapear(copy);
    }

    public async Task CancelarAsync(Guid idTrabajo, string motivo, CancellationToken tokenCancelacion)
    {
        var trabajo = await contextoDbActual.Db.TrabajosImpresion.SingleOrDefaultAsync(
            x => x.Id == idTrabajo && x.IdSucursal == identidad.IdSucursal,
            tokenCancelacion)
            ?? throw TrabajoNoEncontrado();
        if (trabajo.Estado is EstadoTrabajoImpresion.Enviando or EstadoTrabajoImpresion.AceptadoPorCola)
            throw new ExcepcionEstacionImpresion("TRABAJO_NO_CANCELABLE", "El trabajo ya fue enviado al sistema de impresión.", StatusCodes.Status409Conflict);
        if (trabajo.Estado is EstadoTrabajoImpresion.Cancelado or EstadoTrabajoImpresion.Vencido)
            return;
        var ahora = AhoraUtc;
        trabajo.Estado = EstadoTrabajoImpresion.Cancelado;
        trabajo.ReservaVenceEn = null;
        trabajo.UltimoCodigoError = "CANCELADO_POR_USUARIO";
        trabajo.UltimoDetalleError = Truncar(motivo, 300);
        try { await contextoDbActual.Db.SaveChangesAsync(tokenCancelacion); }
        catch (DbUpdateConcurrencyException)
        {
            contextoDbActual.Db.Entry(trabajo).State = EntityState.Detached;
            throw new ExcepcionEstacionImpresion("TRABAJO_NO_CANCELABLE", "El estado del trabajo cambió mientras se cancelaba.", StatusCodes.Status409Conflict);
        }
    }

    public async Task<PanelImpresionRespuesta> ObtenerPanelAsync(CancellationToken tokenCancelacion)
    {
        await VencerTrabajosEnColaAsync(null, tokenCancelacion);
        await RecuperarReservasVencidasAsync(null, tokenCancelacion);
        await AplicarRetencionAsync(tokenCancelacion);
        var ahora = AhoraUtc;
        var trabajos = contextoDbActual.Db.TrabajosImpresion.AsNoTracking().Where(x => x.IdSucursal == identidad.IdSucursal);
        var pendientes = await trabajos.CountAsync(x => x.Estado == EstadoTrabajoImpresion.Pendiente || x.Estado == EstadoTrabajoImpresion.ReintentoProgramado, tokenCancelacion);
        var requierenAtencion = await trabajos.CountAsync(x => x.Estado == EstadoTrabajoImpresion.RequiereAtencion, tokenCancelacion);
        var aceptadosHoy = await trabajos.CountAsync(x => x.Estado == EstadoTrabajoImpresion.AceptadoPorCola && x.AceptadoPorColaEn >= ahora.Date, tokenCancelacion);
        var masAntiguo = await trabajos.Where(x => x.Estado == EstadoTrabajoImpresion.Pendiente || x.Estado == EstadoTrabajoImpresion.ReintentoProgramado)
            .MinAsync(x => (DateTime?)x.CreadoEn, tokenCancelacion);
        var limiteFueraDeLinea = ahora.AddSeconds(-opciones.SegundosHastaFueraDeLinea);
        var estacionesFueraDeLinea = await contextoDbActual.Db.EstacionesImpresion.AsNoTracking().CountAsync(
            x => x.IdSucursal == identidad.IdSucursal && x.Habilitada && x.RevocadaEn == null
                && (x.VistaPorUltimaVezEn == null || x.VistaPorUltimaVezEn < limiteFueraDeLinea), tokenCancelacion);
        var impresorasAusentes = await contextoDbActual.Db.Impresoras.AsNoTracking().CountAsync(
            x => x.Estacion.IdSucursal == identidad.IdSucursal && x.Habilitada && !x.Presente, tokenCancelacion);
        return new(pendientes, requierenAtencion, aceptadosHoy, estacionesFueraDeLinea, impresorasAusentes, masAntiguo);
    }

    private async Task<TrabajoImpresionReservadoRespuesta?> ReservarUnoAsync(Guid idEstacion, CancellationToken tokenCancelacion)
    {
        var db = contextoDbActual.Db;
        await using var transaction = await db.Database.BeginTransactionAsync(tokenCancelacion);
        var ahora = AhoraUtc;
        TrabajoImpresion? trabajo;
        if (db.Database.IsRelational())
        {
            trabajo = await db.TrabajosImpresion.FromSqlInterpolated($$"""
                SELECT * FROM "TrabajosImpresion"
                WHERE "IdEstacion" = {{idEstacion}}
                  AND "Estado" IN ('Pendiente', 'ReintentoProgramado')
                  AND "DisponibleEn" <= {{ahora}}
                  AND "VenceEn" > {{ahora}}
                ORDER BY "CreadoEn", "Id"
                FOR UPDATE SKIP LOCKED
                LIMIT 1
                """).SingleOrDefaultAsync(tokenCancelacion);
        }
        else
        {
            trabajo = await db.TrabajosImpresion.Where(x => x.IdEstacion == idEstacion
                    && (x.Estado == EstadoTrabajoImpresion.Pendiente || x.Estado == EstadoTrabajoImpresion.ReintentoProgramado)
                    && x.DisponibleEn <= ahora && x.VenceEn > ahora)
                .OrderBy(x => x.CreadoEn).ThenBy(x => x.Id)
                .FirstOrDefaultAsync(tokenCancelacion);
        }

        if (trabajo is null)
        {
            await transaction.CommitAsync(tokenCancelacion);
            return null;
        }

        var idReserva = Guid.NewGuid();
        trabajo.Estado = EstadoTrabajoImpresion.Reservado;
        trabajo.IdReserva = idReserva;
        trabajo.ReservaVenceEn = ahora.AddSeconds(opciones.SegundosReserva);
        trabajo.CantidadIntentos++;
        trabajo.UltimoCodigoError = null;
        trabajo.UltimoDetalleError = null;
        await db.SaveChangesAsync(tokenCancelacion);
        await transaction.CommitAsync(tokenCancelacion);
        return new(trabajo.Id, trabajo.IdSolicitud, trabajo.CreadoEn, idReserva, trabajo.ReservaVenceEn.Value, trabajo.TipoDocumento,
            trabajo.VersionEsquema, trabajo.VersionPlantilla, trabajo.ContenidoJson, trabajo.NombreSistemaImpresora,
            trabajo.AnchoPapelMm, trabajo.Codificacion, trabajo.Copias);
    }

    private async Task RecuperarReservasVencidasAsync(Guid? idEstacion, CancellationToken tokenCancelacion)
    {
        var ahora = AhoraUtc;
        var consultaDb = contextoDbActual.Db.TrabajosImpresion.Where(x => x.IdSucursal == identidad.IdSucursal
                && x.ReservaVenceEn < ahora
                && (x.Estado == EstadoTrabajoImpresion.Reservado || x.Estado == EstadoTrabajoImpresion.Enviando))
            .OrderBy(x => x.Id).AsQueryable();
        if (idEstacion.HasValue) consultaDb = consultaDb.Where(x => x.IdEstacion == idEstacion.Value);
        var trabajos = await consultaDb.ToListAsync(tokenCancelacion);
        foreach (var trabajo in trabajos)
        {
            var estabaEnviando = trabajo.Estado == EstadoTrabajoImpresion.Enviando;
            trabajo.Estado = estabaEnviando ? EstadoTrabajoImpresion.RequiereAtencion
                : trabajo.VenceEn <= ahora ? EstadoTrabajoImpresion.Vencido : EstadoTrabajoImpresion.ReintentoProgramado;
            trabajo.DisponibleEn = ahora;
            trabajo.UltimoCodigoError = estabaEnviando ? "RESERVA_VENCIDA_DESPUES_ENVIO" : "RESERVA_VENCIDA_ANTES_ENVIO";
            trabajo.ReservaVenceEn = null;
            await GuardarRecuperacionAsync(trabajo, tokenCancelacion);
        }
    }

    private async Task VencerTrabajosEnColaAsync(Guid? idEstacion, CancellationToken tokenCancelacion)
    {
        var ahora = AhoraUtc;
        var consultaDb = contextoDbActual.Db.TrabajosImpresion.Where(x => x.IdSucursal == identidad.IdSucursal
            && x.VenceEn <= ahora
            && (x.Estado == EstadoTrabajoImpresion.Pendiente || x.Estado == EstadoTrabajoImpresion.ReintentoProgramado));
        if (idEstacion.HasValue) consultaDb = consultaDb.Where(x => x.IdEstacion == idEstacion);
        var vencidos = await consultaDb.ToListAsync(tokenCancelacion);
        foreach (var trabajo in vencidos)
        {
            trabajo.Estado = EstadoTrabajoImpresion.Vencido;
            trabajo.UltimoCodigoError = "TRABAJO_IMPRESION_VENCIDO";
            await GuardarRecuperacionAsync(trabajo, tokenCancelacion);
        }
    }

    private async Task AplicarRetencionAsync(CancellationToken tokenCancelacion)
    {
        var limiteRetencion = AhoraUtc.AddDays(-opciones.DiasRetencionContenido);
        var trabajos = await contextoDbActual.Db.TrabajosImpresion.Where(x => x.IdSucursal == identidad.IdSucursal
            && x.CreadoEn < limiteRetencion && x.ContenidoJson != "{}").Take(500).ToListAsync(tokenCancelacion);
        foreach (var trabajo in trabajos) trabajo.ContenidoJson = "{}";
        if (trabajos.Count > 0) await contextoDbActual.Db.SaveChangesAsync(tokenCancelacion);
    }

    private async Task<TrabajoImpresion> ObtenerTrabajoReservadoAsync(
        Guid idTrabajo, Guid idReserva, EstadoTrabajoImpresion estadoRequerido, CancellationToken tokenCancelacion)
    {
        var idEstacion = await RequerirIdEstacionActivaAsync(tokenCancelacion);
        return await contextoDbActual.Db.TrabajosImpresion.SingleOrDefaultAsync(x =>
            x.Id == idTrabajo && x.IdEstacion == idEstacion && x.IdReserva == idReserva
            && x.ReservaVenceEn > AhoraUtc && x.Estado == estadoRequerido, tokenCancelacion)
            ?? throw ReservaInvalida();
    }

    private async Task GuardarReservaAsync(CancellationToken tokenCancelacion)
    {
        try { await contextoDbActual.Db.SaveChangesAsync(tokenCancelacion); }
        catch (DbUpdateConcurrencyException exception)
        {
            foreach (var entry in exception.Entries) entry.State = EntityState.Detached;
            throw ReservaInvalida();
        }
    }

    private async Task GuardarRecuperacionAsync(TrabajoImpresion trabajo, CancellationToken tokenCancelacion)
    {
        try { await contextoDbActual.Db.SaveChangesAsync(tokenCancelacion); }
        catch (DbUpdateConcurrencyException)
        {
            // Another request renewed or transitioned this lease; its decision wins.
            contextoDbActual.Db.Entry(trabajo).State = EntityState.Detached;
        }
    }

    private IQueryable<TrabajoImpresion> TrabajosConDestino() => contextoDbActual.Db.TrabajosImpresion
        .Include(x => x.Estacion);

    private Guid RequerirIdEstacion()
    {
        if (identidad.TipoAutenticacion != "estacion_impresion" || identidad.IdEstacion is not Guid idEstacion)
            throw new ExcepcionEstacionImpresion("ESTACION_NO_AUTORIZADA", "Se requiere una estación de impresión.", StatusCodes.Status403Forbidden);
        return idEstacion;
    }

    private async Task<Guid> RequerirIdEstacionActivaAsync(CancellationToken tokenCancelacion)
    {
        var idEstacion = RequerirIdEstacion();
        var active = await contextoDbActual.Db.EstacionesImpresion.AsNoTracking().AnyAsync(x =>
            x.Id == idEstacion && x.IdSucursal == identidad.IdSucursal && x.Habilitada && x.RevocadaEn == null,
            tokenCancelacion);
        if (!active)
            throw new ExcepcionEstacionImpresion("ESTACION_DESHABILITADA", "La estación está deshabilitada.", StatusCodes.Status403Forbidden);
        return idEstacion;
    }

    private void AsegurarHabilitada()
    {
        if (!opciones.Habilitada || !opciones.TrabajadorHabilitado)
            throw new ExcepcionEstacionImpresion("IMPRESION_DISTRIBUIDA_DESHABILITADA", "La impresión distribuida no está habilitada.", StatusCodes.Status503ServiceUnavailable);
    }

    private static string? Truncar(string? value, int length) => string.IsNullOrWhiteSpace(value)
        ? null
        : value.Trim()[..Math.Min(value.Trim().Length, length)];
    private static bool EsViolacionUnicidad(DbUpdateException exception) =>
        exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation };
    private static ExcepcionEstacionImpresion TrabajoInvalido() =>
        new("TRABAJO_IMPRESION_INVALIDO", "El trabajo de impresión es inválido.", StatusCodes.Status400BadRequest);
    private static ExcepcionEstacionImpresion ReservaInvalida() =>
        new("RESERVA_TRABAJO_IMPRESION_INVALIDA", "La reserva del trabajo venció o no pertenece a esta estación.", StatusCodes.Status409Conflict);
    private static ExcepcionEstacionImpresion TrabajoNoEncontrado() =>
        new("TRABAJO_IMPRESION_NO_ENCONTRADO", "El trabajo de impresión no existe.", StatusCodes.Status404NotFound);
    private static ResumenTrabajoImpresionRespuesta Mapear(TrabajoImpresion trabajo) => new(
        trabajo.Id, trabajo.IdSolicitud, trabajo.TipoDocumento, trabajo.NombreVisibleImpresora, trabajo.IdEstacion, trabajo.Estacion.Nombre,
        trabajo.Estado, trabajo.CreadoEn, trabajo.VenceEn, trabajo.UltimoCodigoError);
    private DateTime AhoraUtc => proveedorTiempo.GetUtcNow().UtcDateTime;
}
