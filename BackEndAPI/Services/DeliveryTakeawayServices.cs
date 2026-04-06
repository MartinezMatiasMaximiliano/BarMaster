using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using static QuestPDF.Helpers.Colors;

namespace BackEndAPI.Services
{
    public class DeliveryTakeawayServices : IDeliveryTakeawayServices
    {
        private readonly IDeliveryTakeawayRepository _deliveryTakeawayRepository;
        private readonly ICajasServices _cajasServices;
        private readonly IProductosRepository _productosRepository;
        public DeliveryTakeawayServices(IDeliveryTakeawayRepository deliveryTakeawayRepository, ICajasServices cajasServices, IProductosRepository productosRepository)
        {
            _deliveryTakeawayRepository = deliveryTakeawayRepository;
            _cajasServices = cajasServices;
            _productosRepository = productosRepository;
        }
        public async Task<IEnumerable<DeliveryAndTakeaway>?> GetListaDeliveryTakeaways(Guid IdSucursal)
        {
            return await _deliveryTakeawayRepository.ObtenerPorIdSucursal(IdSucursal);
        }
        public async Task<DeliveryAndTakeaway?> ObtenerDeliveryTakeawayPorId(Guid IdDeliveryTakeaway)
        {
            return await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(IdDeliveryTakeaway);
        }
        public async Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(Guid Idsucursal, CrearDeliveryTakeawayDTO request)
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
                Estado = "Abierta"
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
                precioEnvio = await _deliveryTakeawayRepository.GetPrecioEnvioPorId(request.IdTipoEnvio);

            }

            if (request.Origen == "Takeaway")
            {
                DeliveryTakeaway.Direccion = null;
                DeliveryTakeaway.Telefono = null;
                DeliveryTakeaway.IdTipoEnvio = null;
            }

            foreach (var item in request.ListaIDProductos)
            {
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

                        IdVisita = visitaCreada.Id,
                        IdProducto = item.IdProducto,
                        NombreProducto = producto.Nombre,
                        Detalles = item.Detalles,
                        PrecioDelMomento = producto.Precio,
                        EstadoPagado = false,
                        EstadoPedido = "Pendiente",
                    };
                    visitaCreada.Total += producto.Precio;
                    visitaCreada.Productos.Add(productoPorVisita);
                }
            }

            DeliveryTakeaway.PrecioTotal = visitaCreada.Total + precioEnvio;
            return await _deliveryTakeawayRepository.CrearDeliveryTakeaway(DeliveryTakeaway, visitaCreada);
        }
        public async Task<DeliveryAndTakeaway?> MarcarComoEntregado(Guid IdDeliveryTakeaway)
        {
            throw new NotImplementedException();
        }
        public async Task<DeliveryAndTakeaway?> ModificarDatosDeliveryTakeaway(ModificarDeliveryTakeawayDTO request)
        {
            var deliveryTakeawayExistente = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(request.IdDeliveryTakeaway);
            if (deliveryTakeawayExistente == null) throw new Exception("No se encontró el pedido");

            request.NombreCliente = request.NombreCliente ?? deliveryTakeawayExistente.NombreCliente;
            request.Telefono = request.Telefono ?? deliveryTakeawayExistente.Telefono;
            request.Direccion = request.Direccion ?? deliveryTakeawayExistente.Direccion;
            request.Indicaciones = request.Indicaciones ?? deliveryTakeawayExistente.Indicaciones;
            return await _deliveryTakeawayRepository.ModificarDeliveryTakeaway(deliveryTakeawayExistente);
        }
        
        public async Task<bool> EliminarDeliveryTakeaway(Guid IdDeliveryTakeaway)
        {
            var deliveryTakeawayExistente = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorId(IdDeliveryTakeaway);
            if (deliveryTakeawayExistente == null) throw new Exception("No se encontró el pedido");
            return await _deliveryTakeawayRepository.EliminarDeliveryTakeaway(deliveryTakeawayExistente);
        }

    }
}
