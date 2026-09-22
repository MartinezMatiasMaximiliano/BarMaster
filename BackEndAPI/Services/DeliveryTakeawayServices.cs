using Amazon.Runtime.Internal;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Exceptions;
using BackEndAPI.Impresion.Documentos;
using BackEndAPI.Impresion.Trabajos;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Services.Pedidos;
using BackEndAPI.Tenancy.Services;

namespace BackEndAPI.Services
{
    public class DeliveryTakeawayServices : IDeliveryTakeawayServices
    {
        private readonly IDeliveryTakeawayRepository _deliveryTakeawayRepository;
        private readonly ICajasServices _cajasServices;
        private readonly IProductosRepository _productosRepository;
        private readonly IPersonasRepository _personasRepository;
        private readonly IStockServices _stockServices;
        private readonly IDatabaseTransactionManager _transactionManager;
        private readonly IServicioDocumentoImpresion _servicioDocumentoImpresion;
        private readonly IPublicadorNotificacionesPedido _publicadorNotificaciones;
        public DeliveryTakeawayServices(IDeliveryTakeawayRepository deliveryTakeawayRepository, ICajasServices cajasServices,
            IProductosRepository productosRepository,
            IPersonasRepository personasRepository,
            IStockServices stockServices,
            IDatabaseTransactionManager transactionManager,
            IServicioDocumentoImpresion servicioDocumentoImpresion,
            IPublicadorNotificacionesPedido publicadorNotificaciones)
        {
            _deliveryTakeawayRepository = deliveryTakeawayRepository;
            _cajasServices = cajasServices;
            _productosRepository = productosRepository;
            _personasRepository = personasRepository;
            _stockServices = stockServices;
            _transactionManager = transactionManager;
            _servicioDocumentoImpresion = servicioDocumentoImpresion;
            _publicadorNotificaciones = publicadorNotificaciones;
        }

        //METODOS
        public async Task<IEnumerable<DeliveryAndTakeaway>?> GetListaDeliveryTakeaways(Guid IdSucursal, DateTimeOffset? Desde, DateTimeOffset? Hasta)
        {
            if (Desde.HasValue && Hasta.HasValue && Hasta.Value < Desde.Value)
                throw new BusinessRuleException("La fecha hasta no puede ser anterior a la fecha desde");

            return await _deliveryTakeawayRepository.ObtenerPorIdSucursal(
                IdSucursal,
                Desde?.UtcDateTime,
                Hasta?.UtcDateTime);
        }
        public async Task<IEnumerable<DeliveryAndTakeaway>?> GetListaDeliveryTakeawaysPorCaja(Guid IdSucursal, Guid IdCaja)
        {
            if (IdCaja == Guid.Empty) throw new BusinessRuleException("Caja no identificada");
            return await _deliveryTakeawayRepository.ObtenerPorIdCaja(IdSucursal, IdCaja);
        }
        public async Task<DeliveryAndTakeaway?> ObtenerDeliveryTakeawayPorId(Guid IdDeliveryTakeaway)
        {
            return await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(IdDeliveryTakeaway)
                ?? throw new NotFoundException("No se encontró el pedido");
        }
        public async Task<DeliveryAndTakeaway?> MarcarComoEntregado(Guid IdDeliveryTakeaway, bool entregado = true)
        {
            if (IdDeliveryTakeaway == Guid.Empty) throw new BusinessRuleException("Id vacio");

            var busqueda = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(IdDeliveryTakeaway);
            if (busqueda == null) throw new NotFoundException("No se encontró el pedido");
            busqueda.Entregado = entregado;
            await _deliveryTakeawayRepository.ModificarDeliveryTakeaway(busqueda);
            return busqueda;

        }

        //METODOS
        public async Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(Guid Idsucursal, CrearDeliveryTakeawayDTO request)
        {
            var idComando = Guid.NewGuid();
            IReadOnlyList<CrearSolicitudImpresionRespuesta> solicitudes = [];

            var pedido = await _transactionManager.ExecuteAsync(async () =>
            {
                var creado = await CrearDeliveryTakeawayCoreAsync(Idsucursal, request);
                if (creado != null)
                {
                    solicitudes = await _servicioDocumentoImpresion.EncolarComandasAsync(
                        creado.Visita,
                        creado.Visita.Productos.ToList(),
                        idComando,
                        CancellationToken.None);
                }

                return creado;
            });

            await _publicadorNotificaciones.PublicarAsync(solicitudes, idComando);
            return pedido;
        }
        public Task<DeliveryAndTakeaway?> ModificarDeliveryTakeaway(ModificarDeliveryTakeawayDTO request) =>
            _transactionManager.ExecuteAsync(() => ModificarDatosDeliveryTakeawayCoreAsync(request));
        public Task<bool> EliminarDeliveryTakeaway(Guid IdDeliveryTakeaway) =>
            _transactionManager.ExecuteAsync(() => EliminarDeliveryTakeawayCoreAsync(IdDeliveryTakeaway));

        //CORES
        private async Task<DeliveryAndTakeaway?> CrearDeliveryTakeawayCoreAsync(Guid Idsucursal, CrearDeliveryTakeawayDTO request)
        {
            if (request == null) throw new BusinessRuleException("Datos del pedido no enviados");
            var IdCaja = await _cajasServices.BuscarCajaAbiertaPorIdSucursal(Idsucursal);
            if (IdCaja == null) throw new NotFoundException("No hay una caja abierta");

            var visitaCreada = new Visita
            {
                IdCaja = IdCaja.Id,
                IdMozo = null,
                IdMesa = null,
                Origen = request.Origen,
                Estado = "Abierta"
            };

            var DeliveryTakeaway = new DeliveryAndTakeaway
            {
                IdSucursal = Idsucursal,
                IdVisita = visitaCreada.Id,
                Visita = visitaCreada,
                NombreCliente = request.NombreCliente,
                Indicaciones = request.Indicaciones,
            };

            switch (request.Origen)
            {
                case "Delivery":
                    DeliveryTakeaway.Direccion = request.Direccion;
                    DeliveryTakeaway.Telefono = request.Telefono ?? "";
                    DeliveryTakeaway.IdTipoEnvio = request.IdTipoEnvio;
                    if (request.IdCadete.HasValue)
                    {
                        var cadeteNuevo = await _personasRepository.GetPersonaPorId(request.IdCadete.Value)
                            ?? throw new NotFoundException("Cadete no encontrado");
                        if (cadeteNuevo.IdRol != 3) throw new BusinessRuleException("La persona seleccionada no es cadete");
                        DeliveryTakeaway.Cadete = cadeteNuevo;
                    }
                    DeliveryTakeaway.PrecioEnvio = await _deliveryTakeawayRepository.GetPrecioEnvioPorId(request.IdTipoEnvio);
                    break;
                case "Takeaway":
                    DeliveryTakeaway.Direccion = null;
                    DeliveryTakeaway.Telefono = request.Telefono ?? null;
                    DeliveryTakeaway.IdTipoEnvio = null;
                    DeliveryTakeaway.Cadete = null;
                    DeliveryTakeaway.PrecioEnvio = 0;
                    break;
                default:
                    throw new BusinessRuleException("Origen no válido. El campo 'Origen' debe ser 'Delivery' o 'Takeaway'.");
            }

            await AgregarProductosHelperAsync(request.ListaProductos, DeliveryTakeaway);
            visitaCreada.Total += DeliveryTakeaway.PrecioEnvio;
            DeliveryTakeaway.PrecioTotal = visitaCreada.Total;

            DeliveryAndTakeaway? response = await _deliveryTakeawayRepository.CrearDeliveryTakeaway(DeliveryTakeaway, visitaCreada);

            var cantidadesStock = request.ListaProductos
                .GroupBy(x => x.IdProducto)
                .ToDictionary(x => x.Key, x => x.Sum(y => y.Cantidad));
            await _stockServices.DescontarVentaAsync(
                Idsucursal,
                cantidadesStock,
                visitaCreada.Id,
                CanalesMovimientoStock.DesdeOrigen(request.Origen));

            return response;
        }
        private async Task<DeliveryAndTakeaway?> ModificarDatosDeliveryTakeawayCoreAsync(ModificarDeliveryTakeawayDTO request)
        {
            if (request.IdDeliveryTakeaway == Guid.Empty) throw new BusinessRuleException("Id del pedido nulo");
            var pedido = await ObtenerPedidoEditableAsync(request.IdDeliveryTakeaway);
            AplicarDatosCliente(pedido, request);
            await AplicarTipoEnvioAsync(pedido, request.IdTipoEnvio);
            await AplicarCadeteAsync(pedido, request.IdCadete);
            var cambios = await AplicarCambiosProductosAsync(pedido, request);
            var response = await _deliveryTakeawayRepository.ModificarDeliveryTakeaway(pedido);
            await AplicarCambiosStockAsync(pedido, cambios);
            return response;
        }

        private async Task<DeliveryAndTakeaway> ObtenerPedidoEditableAsync(Guid idDeliveryTakeaway)
        {
            var pedido = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(idDeliveryTakeaway)
                ?? throw new NotFoundException("No se encontró el pedido");
            if (pedido.Entregado) throw new ConflictException("No se puede modificar un pedido entregado");
            return pedido;
        }

        private static void AplicarDatosCliente(
            DeliveryAndTakeaway pedido,
            ModificarDeliveryTakeawayDTO request)
        {
            pedido.NombreCliente = request.NombreCliente ?? pedido.NombreCliente;
            pedido.Telefono = request.Telefono ?? pedido.Telefono;
            pedido.Direccion = request.Direccion ?? pedido.Direccion;
            pedido.Indicaciones = request.Indicaciones ?? pedido.Indicaciones;
        }

        private async Task AplicarTipoEnvioAsync(DeliveryAndTakeaway pedido, int? idTipoEnvio)
        {
            if (!idTipoEnvio.HasValue) return;

            var precioEnvioNuevo = await _deliveryTakeawayRepository.GetPrecioEnvioPorId(idTipoEnvio);
            pedido.IdTipoEnvio = idTipoEnvio;
            pedido.Visita.Total += precioEnvioNuevo - pedido.PrecioEnvio;
            pedido.PrecioTotal = pedido.Visita.Total;
            pedido.PrecioEnvio = precioEnvioNuevo;
        }

        private async Task AplicarCadeteAsync(DeliveryAndTakeaway pedido, Guid? idCadete)
        {
            if (!idCadete.HasValue) return;

            var cadete = await _personasRepository.GetPersonaPorId(idCadete.Value)
                ?? throw new NotFoundException("Cadete no encontrado");
            if (cadete.IdRol != 3) throw new BusinessRuleException("La persona seleccionada no es cadete");

            pedido.IdCadete = idCadete;
            pedido.Cadete = cadete;
        }

        private async Task<CambiosProductos> AplicarCambiosProductosAsync(DeliveryAndTakeaway pedido, ModificarDeliveryTakeawayDTO request)
        {
            var agregados = request.ProductosAgregados?.ToList() ?? [];
            var idsEliminados = request.ProductosEliminados?.ToList() ?? [];
            var eliminados = ObtenerProductosAEliminar(idsEliminados, pedido);
            if (agregados.Count > 0) await AgregarProductosHelperAsync(agregados, pedido);
            if (eliminados.Count > 0) RemoverProductosHelper(idsEliminados, pedido);
            return new(
                agregados.GroupBy(x => x.IdProducto).ToDictionary(x => x.Key, x => x.Sum(y => y.Cantidad)),
                AgruparCantidades(eliminados));
        }

        private async Task AplicarCambiosStockAsync(DeliveryAndTakeaway pedido, CambiosProductos cambios)
        {
            var canal = CanalesMovimientoStock.DesdeOrigen(pedido.Visita.Origen);
            await _stockServices.ReponerVentaAsync(pedido.IdSucursal, cambios.Eliminados, pedido.IdVisita, canal);
            await _stockServices.DescontarVentaAsync(pedido.IdSucursal, cambios.Agregados, pedido.IdVisita, canal);
        }

        private sealed record CambiosProductos(
            IReadOnlyDictionary<Guid, int> Agregados,
            IReadOnlyDictionary<Guid, int> Eliminados);
        private async Task<bool> EliminarDeliveryTakeawayCoreAsync(Guid IdDeliveryTakeaway)
        {
            if (IdDeliveryTakeaway == Guid.Empty) throw new BusinessRuleException("Id del pedido nulo");

            var deliveryTakeawayExistente = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(IdDeliveryTakeaway);
            if (deliveryTakeawayExistente == null) throw new NotFoundException("No se encontró el pedido");
            if (deliveryTakeawayExistente.Entregado == true) throw new ConflictException("No se puede modificar un pedido entregado");

            var cantidadesStock = deliveryTakeawayExistente.Visita.Productos
                .Where(x => x.IdProducto.HasValue)
                .GroupBy(x => x.IdProducto!.Value)
                .ToDictionary(x => x.Key, x => x.Count());
            await _stockServices.ReponerVentaAsync(
                deliveryTakeawayExistente.IdSucursal,
                cantidadesStock,
                deliveryTakeawayExistente.IdVisita,
                CanalesMovimientoStock.DesdeOrigen(deliveryTakeawayExistente.Visita.Origen));

            return await _deliveryTakeawayRepository.EliminarDeliveryTakeaway(deliveryTakeawayExistente);
        }


        //HELPERS
        private async Task AgregarProductosHelperAsync(IEnumerable<AgregarProductoAVisita> ListaProductos, DeliveryAndTakeaway DeliveryTakeaway)
        {
            foreach (var item in ListaProductos)
            {
                Producto? producto = await _productosRepository.GetProductoPorId(item.IdProducto);
                if (producto == null) throw new NotFoundException($"Producto no encontrado");
                if (item.Cantidad <= 0) throw new BusinessRuleException($"Cantidad no válida");

                for (int i = 1; i <= item.Cantidad; i++)
                {
                    ProductosPorVisita productoPorVisita = new ProductosPorVisita
                    {
                        IdVisita = DeliveryTakeaway.IdVisita,
                        IdProducto = item.IdProducto,
                        NombreProducto = producto.Nombre,
                        Detalles = item.Detalles,
                        PrecioDelMomento = producto.PrecioNeto,
                        IVADelMomento = producto.PorcentajeIVA,
                        EstadoPagado = false,
                        EstadoPedido = "Pendiente",
                    };

                    DeliveryTakeaway.Visita.Productos.Add(productoPorVisita);
                    DeliveryTakeaway.precioProductos += producto.PrecioNeto;
                    DeliveryTakeaway.Visita.Total += producto.PrecioNeto;
                }
            }
            DeliveryTakeaway.PrecioTotal = DeliveryTakeaway.Visita.Total;
        }
        private static List<ProductosPorVisita> ObtenerProductosAEliminar(
            IEnumerable<int> idsProductos,
            DeliveryAndTakeaway deliveryTakeaway)
        {
            var ids = idsProductos.ToList();
            if (ids.Count != ids.Distinct().Count())
            {
                throw new BusinessRuleException("La lista de productos eliminados contiene IDs repetidos");
            }

            var productos = ids
                .Select(id => deliveryTakeaway.Visita.Productos.FirstOrDefault(x => x.Id == id)
                    ?? throw new NotFoundException("item no encontrado"))
                .ToList();

            if (productos.Any(x => x.EstadoPagado))
            {
                throw new ConflictException("item pagado");
            }

            return productos;
        }

        private static Dictionary<Guid, int> AgruparCantidades(IEnumerable<ProductosPorVisita> productos) =>
            productos
                .Where(x => x.IdProducto.HasValue)
                .GroupBy(x => x.IdProducto!.Value)
                .ToDictionary(x => x.Key, x => x.Count());

        private static void RemoverProductosHelper(
            IEnumerable<int> productos,
            DeliveryAndTakeaway DeliveryTakeaway)
        {
            foreach (var id in productos)
            {
                //todo: ids not present on list
                ProductosPorVisita? ppv = DeliveryTakeaway.Visita.Productos.FirstOrDefault(ppv => ppv.Id == id);
                if (ppv == null) throw new NotFoundException("item no encontrado");
                if (ppv.EstadoPagado) throw new ConflictException("item pagado");
                DeliveryTakeaway.precioProductos -= ppv.PrecioDelMomento;
                DeliveryTakeaway.Visita.Total -= ppv.PrecioDelMomento;
                DeliveryTakeaway.Visita.Productos.Remove(ppv);
            }
            DeliveryTakeaway.PrecioTotal = DeliveryTakeaway.Visita.Total;
        }
    }
}
