using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Exceptions;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Tenancy.Services;
using System.Runtime.CompilerServices;
using static QuestPDF.Helpers.Colors;
using BackEndAPI.Impresion.Documentos;
using BackEndAPI.Impresion.Trabajos;
using BackEndAPI.Models.Impresion;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using BackEndAPI.Services.Pedidos;

namespace BackEndAPI.Services
{
    public class VisitasServices : IVisitasServices
    {
        private readonly IVisitasRepository _visitasRepository;
        private readonly IDeliveryTakeawayRepository _deliveryTakeawayRepository;
        private readonly IStockServices _stockServices;
        private readonly IDatabaseTransactionManager _transactionManager;
        private readonly IManejadorAgregarProductos _manejadorAgregarProductos;
        public VisitasServices(
            IVisitasRepository repository,
            IDeliveryTakeawayRepository deliveryTakeawayRepository,
            IStockServices stockServices,
            IDatabaseTransactionManager transactionManager,
            IManejadorAgregarProductos manejadorAgregarProductos)
        {
            _visitasRepository = repository;
            _deliveryTakeawayRepository = deliveryTakeawayRepository;
            _stockServices = stockServices;
            _transactionManager = transactionManager;
            _manejadorAgregarProductos = manejadorAgregarProductos;
        }

        public async Task<Visita> BuscarVisitaPorId(Guid IdVisita)
        {
            var visita = await _visitasRepository.BuscarVisitaPorId(IdVisita);
            if (visita == null)
            {
                throw new NotFoundException("Visita no encontrada");
            }
            return visita;
        }
        public async Task<Visita> AgregarProductos(
            ICollection<AgregarProductoAVisita> productos,
            Guid IdVisita,
            Guid idComando)
        {
            return await _manejadorAgregarProductos.EjecutarAsync(productos, IdVisita, idComando);
#if false
            var inicio = Stopwatch.GetTimestamp();
            _logger.LogInformation("[IMPRESION_DIAGNOSTICO] {TimestampUtc:o} pedido.backend_recibido IdComando={IdComando} IdVisita={IdVisita} Lineas={Lineas}",
                DateTime.UtcNow, idComando, IdVisita, productos.Count);
            IReadOnlyList<CrearSolicitudImpresionRespuesta> solicitudesImpresion = [];
            var visita = await _transactionManager.ExecuteAsync(async () =>
            {
                var resultado = await AgregarProductosNucleoAsync(productos, IdVisita, idComando);
                _logger.LogInformation("[IMPRESION_DIAGNOSTICO] {TimestampUtc:o} pedido.productos_guardados IdComando={IdComando} DuracionMs={DuracionMs}",
                    DateTime.UtcNow, idComando, Stopwatch.GetElapsedTime(inicio).TotalMilliseconds);
                if (!resultado.YaProcesado)
                {
                    solicitudesImpresion = await _servicioDocumentoImpresion.EncolarComandasAsync(
                        resultado.Visita, resultado.ProductosAgregados, idComando, CancellationToken.None);
                    _logger.LogInformation("[IMPRESION_DIAGNOSTICO] {TimestampUtc:o} pedido.comandas_encoladas IdComando={IdComando} Solicitudes={Solicitudes} DuracionMs={DuracionMs}",
                        DateTime.UtcNow, idComando, solicitudesImpresion.Count, Stopwatch.GetElapsedTime(inicio).TotalMilliseconds);
                }
                return resultado.Visita;
            });

            _logger.LogInformation("[IMPRESION_DIAGNOSTICO] {TimestampUtc:o} pedido.transaccion_confirmada IdComando={IdComando} DuracionMs={DuracionMs}",
                DateTime.UtcNow, idComando, Stopwatch.GetElapsedTime(inicio).TotalMilliseconds);
            foreach (var solicitudImpresion in solicitudesImpresion)
            {
                await _servicioTrabajoImpresion.NotificarAsync(solicitudImpresion, CancellationToken.None);
                _logger.LogInformation("[IMPRESION_DIAGNOSTICO] {TimestampUtc:o} pedido.signalr_notificado IdComando={IdComando} IdSolicitud={IdSolicitud} Trabajos={Trabajos} DuracionMs={DuracionMs}",
                    DateTime.UtcNow, idComando, solicitudImpresion.IdSolicitud, solicitudImpresion.Trabajos.Count, Stopwatch.GetElapsedTime(inicio).TotalMilliseconds);
            }
            return visita;
#endif
        }

#if false
        private async Task<ResultadoProductosAgregados> AgregarProductosNucleoAsync(
            ICollection<AgregarProductoAVisita> productos,
            Guid IdVisita,
            Guid idComando)
        {
            decimal totalAgregado = 0;
            if (productos == null || productos.Count <= 0) throw new BusinessRuleException("Lista de productos vacia");
            if (IdVisita == Guid.Empty) throw new BusinessRuleException("IdVisita vacio");

            var comandoInsertado = await RegistrarComandoAsync(idComando, IdVisita);

            var visita = await _visitasRepository.BuscarVisitaPorId(IdVisita);

            if (visita == null) throw new NotFoundException("Visita no encontrada");
            if (idComando == Guid.Empty) throw new BusinessRuleException("El identificador del pedido es inválido");
            if (!comandoInsertado || visita.Productos.Any(x => x.IdComandoAgregado == idComando)) return new(visita, [], true);
            var esDeliveryTakeaway = visita.Origen == "Delivery" || visita.Origen == "Takeaway";
            if (visita.Estado == "Cerrada" && !esDeliveryTakeaway) throw new BusinessRuleException("No se pueden agregar productos a una visita cerrada");

            var productosAgregados = new List<ProductosPorVisita>();
            foreach (var item in productos)
            {
                if (item.Cantidad <= 0) throw new BusinessRuleException("Cantidad no válida");
                //TODO: Mejorar esto, buscar una manera de
                //agregar los productos que si se encuentran y notificar los que no se encuentran... (no no agregar ninguno si algo falla?)
                var producto = await _productosRepository.GetProductoPorId(item.IdProducto);
                if (producto == null)
                {
                    continue;
                }

                for (int i = 1; i <= item.Cantidad; i++)
                {
                    var productoPorVisita = new ProductosPorVisita
                    {

                        IdVisita = IdVisita,
                        IdProducto = item.IdProducto,
                        NombreProducto = producto.Nombre,
                        Detalles = item.Detalles,
                        PrecioDelMomento = producto.PrecioNeto,
                        IVADelMomento = producto.PorcentajeIVA,
                        EstadoPagado = false,
                        EstadoPedido = "Pendiente",
                        IdComandoAgregado = idComando,
                    };
                    totalAgregado += producto.PrecioNeto;
                    visita.Productos.Add(productoPorVisita);
                    productosAgregados.Add(productoPorVisita);
                }
            }

            var cantidadesStock = productos
                .GroupBy(x => x.IdProducto)
                .ToDictionary(x => x.Key, x => x.Sum(y => y.Cantidad));
            await _stockServices.DescontarVentaAsync(
                visita.Caja.IdSucursal,
                cantidadesStock,
                IdVisita,
                CanalesMovimientoStock.DesdeOrigen(visita.Origen));

            if (esDeliveryTakeaway)
            {
                var deliveryTakeaway = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorIdVisita(IdVisita);

                if (deliveryTakeaway == null) throw new NotFoundException("No se encontró el registro de Delivery/Takeaway asociado a esta visita");
                if (deliveryTakeaway.Entregado) throw new ConflictException("No se pueden agregar productos a una orden de Delivery/Takeaway que ya ha sido entregada");

                deliveryTakeaway.PrecioTotal += totalAgregado;
                await _deliveryTakeawayRepository.ModificarDeliveryTakeaway(deliveryTakeaway);
            }

            visita.Total = visita.Productos.Sum(p => p.PrecioDelMomento);
            var visitaGuardada = await _visitasRepository.ModificarVisita(visita);
            return new(visitaGuardada, productosAgregados, false);
        }

        private async Task<bool> RegistrarComandoAsync(Guid idComando, Guid idVisita)
        {
            if (idComando == Guid.Empty) throw new Exception("El identificador del pedido es inválido");
            var db = _contextoDbActual.Db;
            if (db.Database.IsRelational())
            {
                var inserted = await db.Database.ExecuteSqlInterpolatedAsync($$"""
                    INSERT INTO "ComandosPedidoVisita" ("IdComando", "IdVisita", "CreadoEn")
                    VALUES ({{idComando}}, {{idVisita}}, {{DateTime.UtcNow}})
                    ON CONFLICT ("IdComando") DO NOTHING
                    """);
                return inserted == 1;
            }
            if (await db.ComandosPedidoVisita.AnyAsync(x => x.IdComando == idComando)) return false;
            db.ComandosPedidoVisita.Add(new ComandoPedidoVisita { IdComando = idComando, IdVisita = idVisita, CreadoEn = DateTime.UtcNow });
            await db.SaveChangesAsync();
            return true;
        }

        private sealed record ResultadoProductosAgregados(
            Visita Visita,
            IReadOnlyList<ProductosPorVisita> ProductosAgregados,
            bool YaProcesado);
#endif
        
        public async Task<IEnumerable<Visita>> ObtenerVisitasActivas()
        {
            return await _visitasRepository.ObtenerVisitasActivas();
        }

        public async Task<IEnumerable<Visita>> ObtenerTodasLasVisitas(DateTimeOffset? desde, DateTimeOffset? hasta)
        {
            if (desde.HasValue != hasta.HasValue)
                throw new BusinessRuleException("Las fechas desde y hasta deben enviarse juntas");
            if (desde.HasValue && hasta!.Value < desde.Value)
                throw new BusinessRuleException("La fecha hasta no puede ser anterior a la fecha desde");

            return await _visitasRepository.ObtenerTodasLasVisitas(
                desde?.UtcDateTime,
                hasta?.UtcDateTime);
        }

        public async Task<decimal> CalcularTotal(Guid IdVisita)
        {
            var visita = await _visitasRepository.BuscarVisitaPorId(IdVisita);
            if (visita == null)
            {
                throw new NotFoundException("Visita no encontrada");
            }
            return visita.Productos?.Sum(p => p.PrecioDelMomento) ?? 0;
        }

        public Task<bool> EliminarProductos(Guid IdVisita, ICollection<int> IdsProductos) =>
            _transactionManager.ExecuteAsync(() => EliminarProductosCoreAsync(IdVisita, IdsProductos));

        private async Task<bool> EliminarProductosCoreAsync(Guid IdVisita, ICollection<int> IdsProductos)
        {
            if (IdVisita == Guid.Empty) throw new BusinessRuleException("El IdVisita no puede estar vacío");
            if (IdsProductos == null || IdsProductos.Count == 0) throw new BusinessRuleException("Lista de IDs de productos vacía");

            var visita = await _visitasRepository.BuscarVisitaPorId(IdVisita);
            if (visita == null) throw new NotFoundException("Visita no encontrada");
            var esDeliveryTakeaway = visita.Origen == "Delivery" || visita.Origen == "Takeaway";
            if (visita.Estado == "Cerrada" && !esDeliveryTakeaway) throw new BusinessRuleException("No se pueden eliminar productos de una visita cerrada");

            var productosEnVisita = visita.Productos?.Select(p => p.Id).ToList() ?? new List<int>();
            var productosNoEncontrados = IdsProductos.Where(id => !productosEnVisita.Contains(id)).ToList();

            if (productosNoEncontrados.Any()) throw new BusinessRuleException($"Los siguientes IDs de productos no pertenecen a esta visita: {string.Join(", ", productosNoEncontrados)}");

            var productosAEliminar = visita.Productos.Where(p => IdsProductos.Contains(p.Id)).ToList();
            var totalAEliminar = productosAEliminar.Sum(p => p.PrecioDelMomento);
            var cantidadesStock = productosAEliminar
                .Where(x => x.IdProducto.HasValue)
                .GroupBy(x => x.IdProducto!.Value)
                .ToDictionary(x => x.Key, x => x.Count());

            await _stockServices.ReponerVentaAsync(
                visita.Caja.IdSucursal,
                cantidadesStock,
                IdVisita,
                CanalesMovimientoStock.DesdeOrigen(visita.Origen));

            if (esDeliveryTakeaway)
            {
                var DeliveryTakeaway = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorIdVisita(IdVisita);
                if (DeliveryTakeaway == null) throw new NotFoundException("No se encontró el registro de Delivery/Takeaway asociado a esta visita");
                if (DeliveryTakeaway.Entregado) throw new ConflictException("No se pueden eliminar productos de una orden de Delivery/Takeaway que ya ha sido entregada");

                DeliveryTakeaway.PrecioTotal -= totalAEliminar;
                await _deliveryTakeawayRepository.ModificarDeliveryTakeaway(DeliveryTakeaway);
            }
            visita.Total = visita.Productos
                .Where(p => !IdsProductos.Contains(p.Id))
                .Sum(p => p.PrecioDelMomento);
            return await _visitasRepository.EliminarProductos(visita, IdsProductos);
        }

        public async Task<bool> CambiarEstadoProducto(int idProducto, string estado)
        {
            // Validaciones de negocio
            if (idProducto <= 0) throw new BusinessRuleException("El IdProducto debe ser mayor a cero");


            if (string.IsNullOrWhiteSpace(estado)) throw new BusinessRuleException("El estado no puede estar vacío");

            var estadosPermitidos = new[] { "Pendiente", "En Preparación", "Listo" };
            if (!estadosPermitidos.Contains(estado)) throw new BusinessRuleException($"El estado '{estado}' no es válido. Los estados permitidos son: {string.Join(", ", estadosPermitidos)}");

            var resultado = await _visitasRepository.CambiarEstadoProducto(idProducto, estado);
            if (!resultado) throw new NotFoundException("Producto no encontrado");
            return true;
        }
    }
}
