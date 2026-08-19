using BackEndAPI.ARCA.Clases;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Tenancy.Services;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using static QuestPDF.Helpers.Colors;

namespace BackEndAPI.Services
{
    public class DeliveryTakeawayServices : IDeliveryTakeawayServices
    {
        private readonly IPagosServices _pagosServices;
        private readonly IDeliveryTakeawayRepository _deliveryTakeawayRepository;
        private readonly ICajasServices _cajasServices;
        private readonly IProductosRepository _productosRepository;
        private readonly IPersonasRepository _personasRepository;
        private readonly IPagosRepository _pagosRepository;
        private readonly IStockServices _stockServices;
        private readonly IDatabaseTransactionManager _transactionManager;
        public DeliveryTakeawayServices(
            IDeliveryTakeawayRepository deliveryTakeawayRepository,
            ICajasServices cajasServices,
            IProductosRepository productosRepository,
            IPersonasRepository personasRepository,
            IPagosRepository pagosRepository,
            IPagosServices pagosServices,
            IStockServices stockServices,
            IDatabaseTransactionManager transactionManager)
        {
            _deliveryTakeawayRepository = deliveryTakeawayRepository;
            _cajasServices = cajasServices;
            _productosRepository = productosRepository;
            _personasRepository = personasRepository;
            _pagosRepository = pagosRepository;
            _pagosServices = pagosServices;
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
        public Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(Guid Idsucursal, CrearDeliveryTakeawayDTO request) =>
            _transactionManager.ExecuteAsync(() => CrearDeliveryTakeawayCoreAsync(Idsucursal, request));

        private async Task<DeliveryAndTakeaway?> CrearDeliveryTakeawayCoreAsync(Guid Idsucursal, CrearDeliveryTakeawayDTO request)
        {
            if (request == null) throw new Exception("Datos del pedido no enviados");
            var IdCaja = await _cajasServices.BuscarCajaAbiertaPorIdSucursal(Idsucursal);
            if (IdCaja == null) throw new Exception("No hay una caja abierta");

            decimal precioEnvio = 0;

            var visitaCreada = new Visita
            {
                IdCaja = IdCaja.Id,
                IdMozo = null,
                IdMesa = null,
                Origen = request.Origen,
                Estado = "Cerrada"
            };

            var DeliveryTakeaway = new DeliveryAndTakeaway
            {
                IdSucursal = Idsucursal,
                IdVisita = visitaCreada.Id,
                NombreCliente = request.NombreCliente,
                Indicaciones = request.Indicaciones,
            };

            if (request.Origen == "Delivery")
            {
                DeliveryTakeaway.Direccion = request.Direccion;
                DeliveryTakeaway.Telefono = request.Telefono ?? "";
                DeliveryTakeaway.IdTipoEnvio = request.IdTipoEnvio;
                DeliveryTakeaway.Cadete = await _personasRepository.GetPersonaPorId(request.IdCadete.Value);
                precioEnvio = await _deliveryTakeawayRepository.GetPrecioEnvioPorId(request.IdTipoEnvio);

            }

            if (request.Origen == "Takeaway")
            {
                DeliveryTakeaway.Direccion = null;
                DeliveryTakeaway.Telefono = request.Telefono ?? "";
                DeliveryTakeaway.IdTipoEnvio = null;
                DeliveryTakeaway.Cadete = null;
                precioEnvio = 0;
            }

            foreach (var item in request.ListaProductos)
            {
                var producto = await _productosRepository.GetProductoPorId(item.IdProducto);
                if (producto == null) throw new Exception($"Producto no encontrado");
                if (item.Cantidad <= 0) throw new Exception($"Cantidad no válida");

                for (int i = 1; i <= item.Cantidad; i++)
                {
                    var productoPorVisita = new ProductosPorVisita
                    {
                        IdVisita = visitaCreada.Id,
                        IdProducto = item.IdProducto,
                        NombreProducto = producto.Nombre,
                        Detalles = item.Detalles,
                        PrecioDelMomento = producto.PrecioNeto,
                        EstadoPagado = false,
                        EstadoPedido = "Pendiente",
                    };
                    visitaCreada.Total += producto.PrecioNeto;
                    visitaCreada.Productos.Add(productoPorVisita);
                }
            }

            visitaCreada.Total += precioEnvio;
            DeliveryTakeaway.PrecioTotal = visitaCreada.Total;//DISCRIMINAR PRECRIO
            //DeliveryTakeaway.PrecioEnvio = visitaCreada.Total;//DISCRIMINAR PRECRIO
            //DeliveryTakeaway.PrecioProductos = visitaCreada.Total;//DISCRIMINAR PRECRIO
            DeliveryAndTakeaway dtwk = await _deliveryTakeawayRepository.CrearDeliveryTakeaway(DeliveryTakeaway, visitaCreada);

            var cantidadesStock = request.ListaProductos
                .GroupBy(x => x.IdProducto)
                .ToDictionary(x => x.Key, x => x.Sum(y => y.Cantidad));
            await _stockServices.DescontarVentaAsync(
                Idsucursal,
                cantidadesStock,
                visitaCreada.Id,
                CanalesMovimientoStock.DesdeOrigen(request.Origen));

            return dtwk;
        }
        public async Task<DeliveryAndTakeaway?> MarcarComoEntregado(Guid IdDeliveryTakeaway)
        {
            throw new NotImplementedException();
        }

        public async Task<DeliveryAndTakeaway?> ModificarDatosDeliveryTakeaway(ModificarDeliveryTakeawayDTO request)
        {
            var deliveryTakeawayExistente = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(request.IdDeliveryTakeaway);
            if (deliveryTakeawayExistente == null) throw new Exception("No se encontró el pedido");

            deliveryTakeawayExistente.NombreCliente = request.NombreCliente ?? deliveryTakeawayExistente.NombreCliente;
            deliveryTakeawayExistente.Telefono = request.Telefono ?? deliveryTakeawayExistente.Telefono;
            deliveryTakeawayExistente.Direccion = request.Direccion ?? deliveryTakeawayExistente.Direccion;
            deliveryTakeawayExistente.Indicaciones = request.Indicaciones ?? deliveryTakeawayExistente.Indicaciones;
            if (request.IdTipoEnvio.HasValue)
            {
                deliveryTakeawayExistente.IdTipoEnvio = request.IdTipoEnvio;
                var precioEnvio = await _deliveryTakeawayRepository.GetPrecioEnvioPorId(request.IdTipoEnvio);
                var totalProductos = deliveryTakeawayExistente.Visita?.Productos?.Sum(p => p.PrecioDelMomento) ?? 0;
                deliveryTakeawayExistente.PrecioTotal = totalProductos + precioEnvio;
            }

            if (request.IdCadete.HasValue)
            {
                var cadete = await _personasRepository.GetPersonaPorId(request.IdCadete.Value);
                if (cadete == null) throw new Exception("Cadete no encontrado");
                if (cadete.IdRol != 3) throw new Exception("La persona seleccionada no es cadete");

                deliveryTakeawayExistente.IdCadete = request.IdCadete;
                deliveryTakeawayExistente.Cadete = cadete;
            }

            if (request.Entregado.HasValue)
            {
                deliveryTakeawayExistente.Entregado = request.Entregado.Value;
            }
            return await _deliveryTakeawayRepository.ModificarDeliveryTakeaway(deliveryTakeawayExistente);
        }
        public Task<bool> EliminarDeliveryTakeaway(Guid IdDeliveryTakeaway) =>
            _transactionManager.ExecuteAsync(() => EliminarDeliveryTakeawayCoreAsync(IdDeliveryTakeaway));

        private async Task<bool> EliminarDeliveryTakeawayCoreAsync(Guid IdDeliveryTakeaway)
        {
            var deliveryTakeawayExistente = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(IdDeliveryTakeaway);
            if (deliveryTakeawayExistente == null) throw new Exception("No se encontró el pedido");

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

       
    }
}
