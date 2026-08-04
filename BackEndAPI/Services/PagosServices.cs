using BackEndAPI.ARCA.Clases;
using BackEndAPI.ARCA.Servicios;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using System.Security.Cryptography.X509Certificates;

namespace BackEndAPI.Services
{
    public class PagosServices : IPagosServices
    {
        private readonly IVisitasRepository _visitasRepository;
        private readonly IPagosRepository _pagosRepository;
        private readonly IDeliveryTakeawayRepository _deliveryTakeawayRepository;
        private readonly WsfeService _wsfeService;
        private readonly WsaaAuthService _wasaaAuthService;

        public PagosServices(IVisitasRepository visitasRepository, IPagosRepository pagosRepository, IDeliveryTakeawayRepository deliveryTakeawayRepository, WsfeService wsfeService, WsaaAuthService wsaaAuthService)
        {
            _visitasRepository = visitasRepository;
            _pagosRepository = pagosRepository;
            _deliveryTakeawayRepository = deliveryTakeawayRepository;
            _wsfeService = wsfeService;
            _wasaaAuthService = wsaaAuthService;
        }

        public async Task<(MovimientoCaja, FacturaElectronica?)> PagarProductos(CrearPagoDTO infoPago)
        {
            var visita = await _visitasRepository.BuscarVisitaPorId(infoPago.IdVisita);
            if (visita == null) throw new Exception("Visita no encontrada");

            var PagoCreado = new MovimientoCaja
            {
                IdTipoMovimientoCaja = infoPago.IdTipoMovimiento,
                IdCaja = visita.IdCaja,
                IdVisita = infoPago.IdVisita,
                Monto = infoPago.MontoAbonado,
                Descripcion = visita.Origen == "Local" ? $"Pago de la visita local id: {visita.Id}" : $"Pago de {visita.Origen} id:{visita.Id}"
            };

            decimal TotalAPagar = 0;
            foreach (int id in infoPago.ListaIdsProductos)
            {
                var productoPorVisita = visita.Productos.FirstOrDefault(p => p.Id == id);
                if (productoPorVisita != null)
                {
                    TotalAPagar = TotalAPagar + productoPorVisita.PrecioDelMomento; // TODO: Verificar si se debe sumar el IVA o no
                    productoPorVisita.IdMovimientoCaja = PagoCreado.Id;
                    productoPorVisita.EstadoPagado = true;
                }
            }

            visita.Total += TotalAPagar - infoPago.descuentoDecimal + infoPago.recargoDecimal;

            if (infoPago.MontoAbonado < TotalAPagar) throw new Exception("Monto insuficiente");

            var (ResultadoPagoCreado, FacturaElectronica) = await _pagosRepository.CrearPago(visita, PagoCreado, infoPago.DatosFacturaARCA, TotalAPagar, infoPago.GenerarFactura);
            return (ResultadoPagoCreado, null);
        }
    }
}

