using BackEndAPI.ARCA.Clases;
using BackEndAPI.ARCA.Servicios;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using System.Globalization;
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

            var movimientoCaja = new MovimientoCaja
            {
                IdTipoMovimientoCaja = infoPago.IdTipoMovimiento,
                IdCaja = visita.IdCaja,
                IdVisita = infoPago.IdVisita,
                Facturado = infoPago.GenerarFactura,
                Descripcion = visita.Origen == "Local" ?
                 $"Pago de mesa {(visita.Mesa != null ? visita.Mesa.Nombre : "")}"
                  :
                 $"Pago de {visita.Origen}"
            };

            decimal TotalAPagar = await CalcularTotalProductos(infoPago.ListaIdsProductos, visita, movimientoCaja.Id);
            if (infoPago.MontoAbonado < TotalAPagar) throw new Exception("Monto insuficiente");

            visita.Total = TotalAPagar - infoPago.descuentoDecimal + infoPago.recargoDecimal; //TODO: REVISAR
            movimientoCaja.MontoAbonado = infoPago.MontoAbonado;
            movimientoCaja.Vuelto = CalcularVuelto(TotalAPagar, movimientoCaja);
            movimientoCaja.MontoTotal = visita.Total;



            var (ResultadoPagoCreado, FacturaElectronica) = await _pagosRepository.CrearPago(visita, movimientoCaja, infoPago.DatosFacturaARCA, TotalAPagar, infoPago.GenerarFactura, infoPago.MontoAbonado);

            return (ResultadoPagoCreado, FacturaElectronica);
        }

        public async Task<decimal> CalcularTotalProductos(ICollection<int> IdProductos, Visita visita, Guid IdMovimientoCaja)
        {
            decimal TotalAPagar = 0;
            if (visita.Origen == "Delivery")
            {
                //RECORDATORIO: en caso de DyTKW,la funcion de crearPago solo se llama con todos los productos de la visita, por lo que el envio
                //solo se cobra una vez, no pueden existir multiples pagos del mismo  DyTKW
                var deliveryTakeaway = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorIdVisita(visita.Id);

                if (deliveryTakeaway.TipoEnvio != null)
                {
                  TotalAPagar += deliveryTakeaway.TipoEnvio.Precio;
                }
            }

            foreach (int id in IdProductos)
            {
                var productoPorVisita = visita.Productos.FirstOrDefault(p => p.Id == id);
                if (productoPorVisita != null)
                {
                    TotalAPagar = TotalAPagar + productoPorVisita.PrecioDelMomento; // TODO: Verificar si se debe sumar el IVA o no
                    productoPorVisita.IdMovimientoCaja = IdMovimientoCaja;
                    productoPorVisita.EstadoPagado = true;
                }
            }
            return TotalAPagar;
        }

        private decimal CalcularVuelto(decimal totalAPagar, MovimientoCaja movimientoCaja)
        {
            var vuelto = Math.Max(0, totalAPagar - movimientoCaja.MontoAbonado);
            var vueltoFormateado = vuelto.ToString("N2", CultureInfo.GetCultureInfo("es-AR"));
            var AbonadoFormateado = movimientoCaja.MontoAbonado.ToString("N2", CultureInfo.GetCultureInfo("es-AR"));
            movimientoCaja.Descripcion = $"{movimientoCaja.Descripcion} | Abonado: $ {AbonadoFormateado} | Vuelto: $ {vueltoFormateado}";
            return vuelto;

        }
    }
}

