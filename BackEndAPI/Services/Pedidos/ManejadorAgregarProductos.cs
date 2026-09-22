using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Impresion.Documentos;
using BackEndAPI.Impresion.Trabajos;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Tenancy.Services;

namespace BackEndAPI.Services.Pedidos;

public interface IManejadorAgregarProductos
{
    Task<Visita> EjecutarAsync(ICollection<AgregarProductoAVisita> productos, Guid idVisita, Guid idComando);
}

public sealed class ManejadorAgregarProductos(
    IVisitasRepository visitas,
    IDeliveryTakeawayRepository deliveries,
    IStockServices stock,
    IDatabaseTransactionManager transacciones,
    IServicioDocumentoImpresion documentos,
    IServicioIdempotenciaComandos idempotencia,
    IConsultaProductosLote consultaProductos,
    IPublicadorNotificacionesPedido notificaciones) : IManejadorAgregarProductos
{
    public async Task<Visita> EjecutarAsync(ICollection<AgregarProductoAVisita> productos, Guid idVisita, Guid idComando)
    {
        IReadOnlyList<CrearSolicitudImpresionRespuesta> solicitudes = [];
        var visita = await transacciones.ExecuteAsync(async () =>
        {
            var resultado = await EjecutarNucleoAsync(productos, idVisita, idComando);
            if (!resultado.YaProcesado)
                solicitudes = await documentos.EncolarComandasAsync(resultado.Visita, resultado.ProductosAgregados,
                    idComando, CancellationToken.None);
            return resultado.Visita;
        });
        await notificaciones.PublicarAsync(solicitudes, idComando);
        return visita;
    }

    private async Task<Resultado> EjecutarNucleoAsync(ICollection<AgregarProductoAVisita> productos, Guid idVisita, Guid idComando)
    {
        if (productos is null || productos.Count == 0) throw new Exception("Lista de productos vacia");
        if (idVisita == Guid.Empty) throw new Exception("IdVisita vacio");
        if (productos.Any(x => x.Cantidad <= 0)) throw new Exception("Cantidad no válida");
        var comandoInsertado = await idempotencia.RegistrarAsync(idComando, idVisita);
        var visita = await visitas.BuscarVisitaPorId(idVisita) ?? throw new Exception("Visita no encontrada");
        if (!comandoInsertado || visita.Productos.Any(x => x.IdComandoAgregado == idComando)) return new(visita, [], true);
        var esDeliveryTakeaway = visita.Origen is "Delivery" or "Takeaway";
        if (visita.Estado == "Cerrada" && !esDeliveryTakeaway) throw new Exception("No se pueden agregar productos a una visita cerrada");

        var encontrados = await consultaProductos.ObtenerAsync(productos.Select(x => x.IdProducto));
        var agregados = new List<ProductosPorVisita>();
        decimal totalAgregado = 0;
        foreach (var item in productos)
        {
            if (!encontrados.TryGetValue(item.IdProducto, out var producto)) continue;
            for (var i = 0; i < item.Cantidad; i++)
            {
                var linea = new ProductosPorVisita { IdVisita = idVisita, IdProducto = item.IdProducto,
                    NombreProducto = producto.Nombre, Detalles = item.Detalles, PrecioDelMomento = producto.PrecioNeto,
                    IVADelMomento = producto.PorcentajeIVA,
                    EstadoPagado = false, EstadoPedido = "Pendiente", IdComandoAgregado = idComando };
                visita.Productos.Add(linea); agregados.Add(linea); totalAgregado += producto.PrecioNeto;
            }
        }
        var cantidades = productos.Where(x => encontrados.ContainsKey(x.IdProducto)).GroupBy(x => x.IdProducto)
            .ToDictionary(x => x.Key, x => x.Sum(y => y.Cantidad));
        await stock.DescontarVentaAsync(visita.Caja.IdSucursal, cantidades, idVisita, CanalesMovimientoStock.DesdeOrigen(visita.Origen));
        if (esDeliveryTakeaway)
        {
            var delivery = await deliveries.ObtenerDeliveryTakeawayPorIdVisita(idVisita)
                ?? throw new Exception("No se encontró el registro de Delivery/Takeaway asociado a esta visita");
            if (delivery.Entregado) throw new Exception("No se pueden agregar productos a una orden de Delivery/Takeaway que ya ha sido entregada");
            delivery.PrecioTotal += totalAgregado;
            await deliveries.ModificarDeliveryTakeaway(delivery);
        }
        visita.Total = visita.Productos.Sum(p => p.PrecioDelMomento);
        return new(await visitas.ModificarVisita(visita), agregados, false);
    }

    private sealed record Resultado(Visita Visita, IReadOnlyList<ProductosPorVisita> ProductosAgregados, bool YaProcesado);
}
