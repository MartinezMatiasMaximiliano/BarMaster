using Amazon.Runtime.Internal;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
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
        public DeliveryTakeawayServices(IDeliveryTakeawayRepository deliveryTakeawayRepository, ICajasServices cajasServices,
            IProductosRepository productosRepository,
            IPersonasRepository personasRepository,
            IStockServices stockServices,
            IDatabaseTransactionManager transactionManager)
        {
            _deliveryTakeawayRepository = deliveryTakeawayRepository;
            _cajasServices = cajasServices;
            _productosRepository = productosRepository;
            _personasRepository = personasRepository;
            _stockServices = stockServices;
            _transactionManager = transactionManager;
        }

        //METODOS
        public async Task<IEnumerable<DeliveryAndTakeaway>?> GetListaDeliveryTakeaways(Guid IdSucursal)
        {
            return await _deliveryTakeawayRepository.ObtenerPorIdSucursal(IdSucursal);
        }
        public async Task<IEnumerable<DeliveryAndTakeaway>?> GetListaDeliveryTakeawaysPorCaja(Guid IdSucursal, Guid IdCaja)
        {
            if (IdCaja == Guid.Empty) throw new Exception("Caja no identificada");
            return await _deliveryTakeawayRepository.ObtenerPorIdCaja(IdSucursal, IdCaja);
        }
        public async Task<DeliveryAndTakeaway?> ObtenerDeliveryTakeawayPorId(Guid IdDeliveryTakeaway)
        {
            return await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(IdDeliveryTakeaway);
        }
        public async Task<DeliveryAndTakeaway?> MarcarComoEntregado(Guid IdDeliveryTakeaway)
        {
            var busqueda = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(IdDeliveryTakeaway);
            if (busqueda == null) throw new Exception("no encontrado");
            busqueda.Entregado = true;
            busqueda.Visita.Estado = "Cerrada";
            await _deliveryTakeawayRepository.ModificarDeliveryTakeaway(busqueda);
            return busqueda;

        }

        //METODOS
        public Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(Guid Idsucursal, CrearDeliveryTakeawayDTO request) =>
            _transactionManager.ExecuteAsync(() => CrearDeliveryTakeawayCoreAsync(Idsucursal, request));
        public Task<DeliveryAndTakeaway?> ModificarDeliveryTakeaway(ModificarDeliveryTakeawayDTO request) =>
            _transactionManager.ExecuteAsync(() => ModificarDatosDeliveryTakeawayCoreAsync(request));
        public Task<bool> EliminarDeliveryTakeaway(Guid IdDeliveryTakeaway) =>
            _transactionManager.ExecuteAsync(() => EliminarDeliveryTakeawayCoreAsync(IdDeliveryTakeaway));

        //CORES
        private async Task<DeliveryAndTakeaway?> CrearDeliveryTakeawayCoreAsync(Guid Idsucursal, CrearDeliveryTakeawayDTO request)
        {
            if (request == null) throw new Exception("Datos del pedido no enviados");
            var IdCaja = await _cajasServices.BuscarCajaAbiertaPorIdSucursal(Idsucursal);
            if (IdCaja == null) throw new Exception("No hay una caja abierta");

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
                    DeliveryTakeaway.Cadete = await _personasRepository.GetPersonaPorId(request.IdCadete.Value);
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
                    throw new Exception("Origen no válido. El campo 'Origen' debe ser 'Delivery' o 'Takeaway'.");
            }

            await AgregarProductosHelperAsync(request.ListaProductos, DeliveryTakeaway);
            visitaCreada.Total += DeliveryTakeaway.PrecioEnvio;

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
            var pedido = await ObtenerPedidoEditableAsync(request.IdDeliveryTakeaway);

            AplicarDatosCliente(pedido, request);
            await AplicarTipoEnvioAsync(pedido, request.IdTipoEnvio);
            await AplicarCadeteAsync(pedido, request.IdCadete);

            var cambiosProductos = await AplicarCambiosProductosAsync(pedido, request);
            var response = await _deliveryTakeawayRepository.ModificarDeliveryTakeaway(pedido);
            await AplicarCambiosStockAsync(pedido, cambiosProductos);

            return response;
        }

        private async Task<DeliveryAndTakeaway> ObtenerPedidoEditableAsync(Guid idDeliveryTakeaway)
        {
            var pedido = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(idDeliveryTakeaway)
                ?? throw new Exception("No se encontró el pedido");
            if (pedido.Entregado) throw new Exception("No se puede modificar un pedido entregado");
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
                ?? throw new Exception("Cadete no encontrado");

            pedido.IdCadete = idCadete;
            pedido.Cadete = cadete;
        }

        private async Task<CambiosProductos> AplicarCambiosProductosAsync(
            DeliveryAndTakeaway pedido,
            ModificarDeliveryTakeawayDTO request)
        {
            var productosAgregados = request.ProductosAgregados?.ToList() ?? new List<AgregarProductoAVisita>();
            var idsProductosEliminados = request.ProductosEliminados?.ToList() ?? new List<int>();
            var productosAEliminar = ObtenerProductosAEliminar(idsProductosEliminados, pedido);
            var cantidadesEliminadas = AgruparCantidades(productosAEliminar);

            if (productosAgregados.Count > 0)
            {
                await AgregarProductosHelperAsync(productosAgregados, pedido);
            }

            if (productosAEliminar.Count > 0)
            {
                RemoverProductosHelper(productosAEliminar, pedido);
            }

            var cantidadesAgregadas = productosAgregados
                .GroupBy(x => x.IdProducto)
                .ToDictionary(x => x.Key, x => x.Sum(y => y.Cantidad));

            return new CambiosProductos(cantidadesAgregadas, cantidadesEliminadas);
        }

        private async Task AplicarCambiosStockAsync(
            DeliveryAndTakeaway pedido,
            CambiosProductos cambios)
        {
            var canal = CanalesMovimientoStock.DesdeOrigen(pedido.Visita.Origen);

            // Se repone primero para evitar una falta transitoria de stock al reemplazar productos.
            await _stockServices.ReponerVentaAsync(
                pedido.IdSucursal,
                cambios.Eliminados,
                pedido.IdVisita,
                canal);

            await _stockServices.DescontarVentaAsync(
                pedido.IdSucursal,
                cambios.Agregados,
                pedido.IdVisita,
                canal);
        }

        private sealed record CambiosProductos(
            IReadOnlyDictionary<Guid, int> Agregados,
            IReadOnlyDictionary<Guid, int> Eliminados);

        private async Task<bool> EliminarDeliveryTakeawayCoreAsync(Guid IdDeliveryTakeaway)
        {
            var deliveryTakeawayExistente = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(IdDeliveryTakeaway);
            if (deliveryTakeawayExistente == null) throw new Exception("No se encontró el pedido");
            if (deliveryTakeawayExistente.Entregado == true) throw new Exception("No se puede modificar un pedido entregado");

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
                if (producto == null) throw new Exception($"Producto no encontrado");
                if (item.Cantidad <= 0) throw new Exception($"Cantidad no válida");

                for (int i = 1; i <= item.Cantidad; i++)
                {
                    ProductosPorVisita productoPorVisita = new ProductosPorVisita
                    {
                        IdVisita = DeliveryTakeaway.IdVisita,
                        IdProducto = item.IdProducto,
                        NombreProducto = producto.Nombre,
                        Detalles = item.Detalles,
                        PrecioDelMomento = producto.PrecioNeto,
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
                throw new Exception("La lista de productos eliminados contiene IDs repetidos");
            }

            var productos = ids
                .Select(id => deliveryTakeaway.Visita.Productos.FirstOrDefault(x => x.Id == id)
                    ?? throw new Exception("item no encontrado"))
                .ToList();

            if (productos.Any(x => x.EstadoPagado))
            {
                throw new Exception("item pagado");
            }

            return productos;
        }

        private static Dictionary<Guid, int> AgruparCantidades(IEnumerable<ProductosPorVisita> productos) =>
            productos
                .Where(x => x.IdProducto.HasValue)
                .GroupBy(x => x.IdProducto!.Value)
                .ToDictionary(x => x.Key, x => x.Count());

        private static void RemoverProductosHelper(
            IEnumerable<ProductosPorVisita> productos,
            DeliveryAndTakeaway deliveryTakeaway)
        {
            foreach (var producto in productos)
            {
                deliveryTakeaway.precioProductos -= producto.PrecioDelMomento;
                deliveryTakeaway.Visita.Total -= producto.PrecioDelMomento;
                deliveryTakeaway.Visita.Productos.Remove(producto);
            }
            deliveryTakeaway.PrecioTotal = deliveryTakeaway.Visita.Total;
        }
    }
}

#region deprecado


//public Task<DeliveryAndTakeaway?> AgregarProductosADeliveryAndTakeaway(Guid Id, List<AgregarProductoAVisita> ListaProductos) =>
//    _transactionManager.ExecuteAsync(() => AgregarProductosCoreAsync(Id, ListaProductos));
//public Task<DeliveryAndTakeaway?> RemoverProductosADeliveryAndTakeaway(Guid Id, List<int> ListaProductos) =>
//    _transactionManager.ExecuteAsync(() => RemoverProductosCoreAsync(Id, ListaProductos));


//private async Task<DeliveryAndTakeaway?> AgregarProductosCoreAsync(Guid Id, List<AgregarProductoAVisita> ListaProductos)
//{
//    var deliveryTakeawayExistente = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(Id);
//    if (deliveryTakeawayExistente == null) throw new Exception("No se encontró el pedido");
//    if (deliveryTakeawayExistente.Entregado == true) throw new Exception("No se puede modificar un pedido entregado");

//    AgregarProductosHelper(ListaProductos, deliveryTakeawayExistente);

//    return await _deliveryTakeawayRepository.ModificarDeliveryTakeaway(deliveryTakeawayExistente);
//}
//private async Task<DeliveryAndTakeaway?> RemoverProductosCoreAsync(Guid Id, List<int> ListaProductos)
//{
//    var deliveryTakeawayExistente = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(Id);
//    if (deliveryTakeawayExistente == null) throw new Exception("No se encontró el pedido");
//    if (deliveryTakeawayExistente.Entregado == true) throw new Exception("No se puede modificar un pedido entregado");

//    RemoverProductosHelper(ListaProductos, deliveryTakeawayExistente);

//    return await _deliveryTakeawayRepository.ModificarDeliveryTakeaway(deliveryTakeawayExistente);
//}
#endregion
