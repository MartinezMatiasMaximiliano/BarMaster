using BackEndAPI.Models;
using BackEndAPI.Models.Impresion;
using BackEndAPI.Impresion.Identidad;
using BackEndAPI.Impresion.Trabajos;
using BackEndAPI.Impresion.Estaciones;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Diagnostics;

namespace BackEndAPI.Impresion.Documentos;

public sealed class ServicioDocumentoImpresion : IServicioDocumentoImpresion
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly ICurrentDbContext contextoDbActual;
    private readonly IIdentidadSolicitudImpresion identidad;
    private readonly IServicioTrabajoImpresion servicioTrabajoImpresion;
    private readonly TimeProvider proveedorTiempo;
    private readonly ILogger<ServicioDocumentoImpresion> registrador;

    public ServicioDocumentoImpresion(
        ICurrentDbContext contextoDbActual,
        IIdentidadSolicitudImpresion identidad,
        IServicioTrabajoImpresion servicioTrabajoImpresion,
        TimeProvider proveedorTiempo,
        ILogger<ServicioDocumentoImpresion> registrador)
    {
        this.contextoDbActual = contextoDbActual;
        this.identidad = identidad;
        this.servicioTrabajoImpresion = servicioTrabajoImpresion;
        this.proveedorTiempo = proveedorTiempo;
        this.registrador = registrador;
    }

    public async Task<CrearSolicitudImpresionRespuesta> SolicitarPreticketAsync(
        ImprimirPreticketSolicitud solicitud,
        CancellationToken tokenCancelacion)
    {
        if (solicitud.IdComando == Guid.Empty || solicitud.IdVisita == Guid.Empty)
            throw DocumentoInvalido();
        var visita = await contextoDbActual.Db.Visitas.AsNoTracking()
            .Include(x => x.Caja).ThenInclude(x => x.Sucursal)
            .Include(x => x.Mesa)
            .Include(x => x.Productos)
            .SingleOrDefaultAsync(x => x.Id == solicitud.IdVisita && x.Caja.IdSucursal == identidad.IdSucursal, tokenCancelacion)
            ?? throw new ExcepcionEstacionImpresion("VISITA_NO_ENCONTRADA", "La mesa o cuenta no existe en esta sucursal.", StatusCodes.Status404NotFound);

        var idsSeleccionados = solicitud.IdsProductos?.Distinct().ToHashSet() ?? [];
        var noPagados = visita.Productos.Where(x => !x.EstadoPagado).ToList();
        if (idsSeleccionados.Count > 0)
        {
            if (idsSeleccionados.Any(id => noPagados.All(x => x.Id != id)))
                throw new ExcepcionEstacionImpresion("PRODUCTOS_PRETICKET_INVALIDOS", "Un producto no pertenece a esta cuenta o ya fue pagado.", StatusCodes.Status400BadRequest);
            noPagados = noPagados.Where(x => idsSeleccionados.Contains(x.Id)).ToList();
        }
        if (noPagados.Count == 0)
            throw new ExcepcionEstacionImpresion("SIN_PRODUCTOS_IMPRIMIBLES", "No hay productos pendientes para imprimir.", StatusCodes.Status409Conflict);

        var lineas = noPagados
            .GroupBy(x => new { x.NombreProducto, x.PrecioDelMomento, Notas = (x.Detalles ?? string.Empty).Trim() })
            .Select(grupo => new LineaPreticketContenido(
                grupo.Count(), grupo.Key.NombreProducto, grupo.Key.PrecioDelMomento,
                string.IsNullOrEmpty(grupo.Key.Notas) ? null : grupo.Key.Notas))
            .OrderBy(x => x.Descripcion)
            .ToList();
        var contenido = new PreticketContenido(
            1,
            visita.Caja.Sucursal?.Nombre ?? "BarMaster",
            visita.Mesa?.Numero.ToString() ?? visita.Origen,
            AhoraUtc,
            lineas,
            lineas.Sum(x => x.Cantidad * x.PrecioUnitario),
            "DOCUMENTO NO VALIDO COMO FACTURA");

        return await servicioTrabajoImpresion.CrearEnrutadosAsync(new(
            solicitud.IdComando,
            TipoDocumentoImpresion.Preticket,
            MomentoImpresion.AlGenerarPreticket,
            JsonSerializer.Serialize(contenido, JsonOptions),
            1,
            1,
            $"preticket:{solicitud.IdVisita:N}:{solicitud.IdComando:N}",
            nameof(Visita),
            solicitud.IdVisita.ToString("N"),
            identidad.IdPersona), tokenCancelacion);
    }

    public async Task<IReadOnlyList<CrearSolicitudImpresionRespuesta>> EncolarComandasAsync(
        Visita visita,
        IReadOnlyList<ProductosPorVisita> productosAgregados,
        Guid idComando,
        CancellationToken tokenCancelacion)
    {
        if (idComando == Guid.Empty || productosAgregados.Count == 0) return [];
        var inicio = Stopwatch.GetTimestamp();
        registrador.LogInformation("[IMPRESION_DIAGNOSTICO] {TimestampUtc:o} comanda.construccion_iniciada IdComando={IdComando} IdVisita={IdVisita} Productos={Productos}",
            DateTime.UtcNow, idComando, visita.Id, productosAgregados.Count);
        var ahora = AhoraUtc;
        var nombreSucursal = await contextoDbActual.Db.Sucursales.AsNoTracking()
            .Where(x => x.Id == identidad.IdSucursal)
            .Select(x => x.Nombre)
            .SingleAsync(tokenCancelacion);
        var nombreMesa = visita.Mesa?.Numero.ToString() ?? visita.Origen;
        var lineas = productosAgregados
            .GroupBy(x => new { x.NombreProducto, Notas = (x.Detalles ?? string.Empty).Trim() })
            .Select(grupo => new LineaComandaContenido(
                grupo.Count(), grupo.Key.NombreProducto,
                string.IsNullOrEmpty(grupo.Key.Notas) ? null : grupo.Key.Notas))
            .OrderBy(x => x.Descripcion)
            .ToList();
        var contenido = new ComandaContenido(1, nombreSucursal, nombreMesa, "Comanda", ahora, lineas);
        try
        {
            var resultado = await servicioTrabajoImpresion.CrearEnrutadosAsync(new(
                Guid.NewGuid(),
                TipoDocumentoImpresion.Comanda,
                MomentoImpresion.AlCargarProductosMesa,
                JsonSerializer.Serialize(contenido, JsonOptions),
                1,
                1,
                $"kitchen:{visita.Id:N}:{idComando:N}",
                nameof(Visita),
                visita.Id.ToString("N"),
                identidad.IdPersona,
                false), tokenCancelacion);
            registrador.LogInformation("[IMPRESION_DIAGNOSTICO] {TimestampUtc:o} comanda.trabajos_creados IdComando={IdComando} IdSolicitud={IdSolicitud} Trabajos={Trabajos} DuracionMs={DuracionMs}",
                DateTime.UtcNow, idComando, resultado.IdSolicitud, resultado.Trabajos.Count, Stopwatch.GetElapsedTime(inicio).TotalMilliseconds);
            return [resultado];
        }
        catch (ExcepcionEstacionImpresion exception)
        {
            registrador.LogWarning("No se creó la comanda para la visita {IdVisita}: {CodigoError}.", visita.Id, exception.Codigo);
            return [];
        }
    }

    public async Task<IReadOnlyList<CrearSolicitudImpresionRespuesta>> EncolarComprobantePagoAsync(
        Visita visita,
        IReadOnlyList<ProductosPorVisita> productosCobrados,
        MovimientoCaja pago,
        CancellationToken tokenCancelacion,
        decimal descuento = 0,
        decimal recargo = 0)
    {
        if (productosCobrados.Count == 0) return [];
        var sucursal = await contextoDbActual.Db.Sucursales.AsNoTracking()
            .Include(x => x.Empresa)
            .Where(x => x.Id == identidad.IdSucursal)
            .SingleAsync(tokenCancelacion);
        var medioPago = await contextoDbActual.Db.TipoMovimientosCajas.AsNoTracking()
            .Where(x => x.Id == pago.IdTipoMovimientoCaja)
            .Select(x => x.Nombre)
            .SingleOrDefaultAsync(tokenCancelacion);
        var lineas = productosCobrados
            .GroupBy(x => new { x.NombreProducto, x.PrecioDelMomento, Notas = (x.Detalles ?? string.Empty).Trim() })
            .Select(grupo => new LineaPreticketContenido(grupo.Count(), grupo.Key.NombreProducto,
                grupo.Key.PrecioDelMomento, string.IsNullOrEmpty(grupo.Key.Notas) ? null : grupo.Key.Notas))
            .OrderBy(x => x.Descripcion)
            .ToList();
        var subtotal = lineas.Sum(x => x.Cantidad * x.PrecioUnitario);
        var contenido = new ComprobantePagoContenido(1, sucursal.Nombre,
            visita.Mesa?.Numero.ToString() ?? visita.Origen, DateTime.SpecifyKind(pago.FechaMovimiento, DateTimeKind.Utc), lineas, pago.MontoTotal,
            pago.MontoAbonado, pago.Vuelto, "DOCUMENTO NO VALIDO COMO FACTURA")
        {
            NombreEmpresa = sucursal.Empresa?.Nombre,
            Cuit = sucursal.Empresa?.Cuit > 0 ? sucursal.Empresa.Cuit.ToString() : null,
            Direccion = sucursal.Direccion,
            Telefono = !string.IsNullOrWhiteSpace(sucursal.Telefono) ? sucursal.Telefono
                : sucursal.Empresa?.Telefonos?.FirstOrDefault(x => !string.IsNullOrWhiteSpace(x)),
            Email = sucursal.Empresa?.Emails?.FirstOrDefault(x => !string.IsNullOrWhiteSpace(x)),
            MedioPago = medioPago,
            ReferenciaPago = pago.Id.ToString("D"),
            Origen = visita.Origen,
            Subtotal = subtotal,
            AjustePedido = pago.MontoTotal + descuento - recargo - subtotal,
            Descuento = descuento,
            Recargo = recargo
        };
        try
        {
            var resultado = await servicioTrabajoImpresion.CrearEnrutadosAsync(new(
                Guid.NewGuid(), TipoDocumentoImpresion.ComprobantePago,
                MomentoImpresion.AlCobrarProductosSinFacturar,
                JsonSerializer.Serialize(contenido, JsonOptions), 1, 1,
                $"payment:{pago.Id:N}", nameof(MovimientoCaja), pago.Id.ToString("N"),
                identidad.IdPersona, true), tokenCancelacion);
            return [resultado];
        }
        catch (ExcepcionEstacionImpresion exception)
        {
            registrador.LogWarning("No se creó el comprobante del pago {IdPago}: {CodigoError}.", pago.Id, exception.Codigo);
            return [];
        }
    }

    private static ExcepcionEstacionImpresion DocumentoInvalido() =>
        new("DOCUMENTO_IMPRESION_INVALIDO", "La solicitud de impresión es inválida.", StatusCodes.Status400BadRequest);
    private DateTime AhoraUtc => proveedorTiempo.GetUtcNow().UtcDateTime;
}
