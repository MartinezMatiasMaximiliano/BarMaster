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
        public Task<DeliveryAndTakeaway?> AgregarProductosADeliveryAndTakeaway(Guid Id, List<AgregarProductoAVisita> ListaProductos) =>
            _transactionManager.ExecuteAsync(() => AgregarProductosCoreAsync(Id, ListaProductos));
        public Task<DeliveryAndTakeaway?> RemoverProductosADeliveryAndTakeaway(Guid Id, List<int> ListaProductos) =>
            _transactionManager.ExecuteAsync(() => RemoverProductosCoreAsync(Id, ListaProductos));
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

            AgregarProductosHelper(request.ListaProductos, DeliveryTakeaway);
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
            var deliveryTakeawayExistente = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(request.IdDeliveryTakeaway);
            if (deliveryTakeawayExistente == null) throw new Exception("No se encontró el pedido");
            if (deliveryTakeawayExistente.Entregado == true) throw new Exception("No se puede modificar un pedido entregado");


            deliveryTakeawayExistente.NombreCliente = request.NombreCliente ?? deliveryTakeawayExistente.NombreCliente;
            deliveryTakeawayExistente.Telefono = request.Telefono ?? deliveryTakeawayExistente.Telefono;
            deliveryTakeawayExistente.Direccion = request.Direccion ?? deliveryTakeawayExistente.Direccion;
            deliveryTakeawayExistente.Indicaciones = request.Indicaciones ?? deliveryTakeawayExistente.Indicaciones;

            if (request.IdTipoEnvio.HasValue)
            {
                var envioNuevo = await _deliveryTakeawayRepository.GetPrecioEnvioPorId(request.IdTipoEnvio);
                deliveryTakeawayExistente.IdTipoEnvio = request.IdTipoEnvio;
                deliveryTakeawayExistente.Visita.Total = deliveryTakeawayExistente.Visita.Total + envioNuevo - deliveryTakeawayExistente.PrecioEnvio;
                deliveryTakeawayExistente.PrecioTotal = deliveryTakeawayExistente.Visita.Total;
                deliveryTakeawayExistente.PrecioEnvio = envioNuevo;
            }

            if (request.IdCadete.HasValue)
            {
                var cadete = await _personasRepository.GetPersonaPorId(request.IdCadete.Value);
                if (cadete == null) throw new Exception("Cadete no encontrado");
                //if (cadete.IdRol != 3) throw new Exception("La persona seleccionada no es cadete");

                deliveryTakeawayExistente.IdCadete = request.IdCadete;
                deliveryTakeawayExistente.Cadete = cadete;
            }
            return await _deliveryTakeawayRepository.ModificarDeliveryTakeaway(deliveryTakeawayExistente);
        }
        private async Task<DeliveryAndTakeaway?> AgregarProductosCoreAsync(Guid Id, List<AgregarProductoAVisita> ListaProductos)
        {
            var deliveryTakeawayExistente = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(Id);
            if (deliveryTakeawayExistente == null) throw new Exception("No se encontró el pedido");
            if (deliveryTakeawayExistente.Entregado == true) throw new Exception("No se puede modificar un pedido entregado");

            AgregarProductosHelper(ListaProductos, deliveryTakeawayExistente);

            return await _deliveryTakeawayRepository.ModificarDeliveryTakeaway(deliveryTakeawayExistente);
        }
        private async Task<DeliveryAndTakeaway?> RemoverProductosCoreAsync(Guid Id, List<int> ListaProductos)
        {
            var deliveryTakeawayExistente = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(Id);
            if (deliveryTakeawayExistente == null) throw new Exception("No se encontró el pedido");
            if (deliveryTakeawayExistente.Entregado == true) throw new Exception("No se puede modificar un pedido entregado");

            RemoverProductosHelper(ListaProductos, deliveryTakeawayExistente);

            return await _deliveryTakeawayRepository.ModificarDeliveryTakeaway(deliveryTakeawayExistente);
        }
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
        private async void AgregarProductosHelper(List<AgregarProductoAVisita> ListaProductos, DeliveryAndTakeaway DeliveryTakeaway)
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
        private async void RemoverProductosHelper(List<int> ListaProductos, DeliveryAndTakeaway DeliveryTakeaway)
        {
            foreach (var item in ListaProductos)
            {
                //todo: ids not present on list
                ProductosPorVisita ppv = DeliveryTakeaway.Visita.Productos.First(ppv => ppv.Id == item);
                if (ppv == null) throw new Exception();
                if (ppv.EstadoPagado) throw new Exception();
                DeliveryTakeaway.precioProductos -= ppv.PrecioDelMomento;
                DeliveryTakeaway.Visita.Total -= ppv.PrecioDelMomento;
                DeliveryTakeaway.Visita.Productos.Remove(ppv);
            }
            DeliveryTakeaway.PrecioTotal = DeliveryTakeaway.Visita.Total;
        }
    }
}
