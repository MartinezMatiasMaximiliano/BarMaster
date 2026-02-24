using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using System.Runtime.CompilerServices;

namespace BackEndAPI.Services
{
    public class DeliveryTakeawayServices : IDeliveryTakeawayServices
    {
        private readonly IDeliveryTakeawayRepository _deliveryTakeawayRepository;
        private readonly ICajasServices _cajasServices;
        private readonly IVisitasServices _visitasServices;
        private readonly IVisitasRepository _visitasRepository;
        public DeliveryTakeawayServices(IDeliveryTakeawayRepository deliveryTakeawayRepository, IVisitasServices visitasServices, ICajasServices cajasServices, IVisitasRepository visitasRepository)
        {
            _deliveryTakeawayRepository = deliveryTakeawayRepository;
            _visitasServices = visitasServices;
            _cajasServices = cajasServices;
            _visitasRepository = visitasRepository;
        }

        public async Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(Guid Idsucursal, CrearDeliveryTakeawayDTO request)
        {
            if (request == null) throw new Exception("Datos del pedido no enviados");
            var IdCaja = await _cajasServices.BuscarCajaAbiertaPorIdSucursal(Idsucursal);

            var visita = new Visita
            {
                IdCaja = IdCaja.Id,
                IdMozo = null,
                IdMesa = null,
                Origen = request.Origen,
                Estado = "Abierta"
            };

            var visitaCreada = await _visitasRepository.CrearVisita(visita);

            var DeliveryTakeaway = new DeliveryAndTakeaway
            {
                IdSucursal = Idsucursal,
                IdVisita = visita.Id,
                NombreCliente = request.NombreCliente
            };

            if (request.Origen == "Delivery")
            {
                DeliveryTakeaway.Direccion = request.Direccion;
                DeliveryTakeaway.Indicaciones = request.Indicaciones;
                DeliveryTakeaway.Telefono = request.Telefono;
                DeliveryTakeaway.IdTipoEnvio = request.IdTipoEnvio;
            }

            if (request.Origen == "Takeaway")
            {
                DeliveryTakeaway.Direccion = null;
                DeliveryTakeaway.IdTipoEnvio = null;
            }

            await _visitasServices.AgregarProductos(request.ListaIDProductos, visitaCreada.Id);
            visitaCreada.Total = await _visitasServices.CalcularTotal(visitaCreada.Id);
            return await _deliveryTakeawayRepository.CrearDeliveryTakeaway(DeliveryTakeaway, visitaCreada);
        }
    }
}
