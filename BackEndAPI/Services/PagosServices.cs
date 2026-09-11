using BackEndAPI.ARCA.Clases;
using BackEndAPI.ARCA.Servicios;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Exceptions;
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

        public PagosServices(IVisitasRepository visitasRepository, IPagosRepository pagosRepository, IDeliveryTakeawayRepository deliveryTakeawayRepository)
        {
            _visitasRepository = visitasRepository;
            _pagosRepository = pagosRepository;
            _deliveryTakeawayRepository = deliveryTakeawayRepository;
        }

        public async Task<(MovimientoCaja, FacturaElectronica?)> PagarProductos(CrearPagoDTO infoPago)
        {
            if (infoPago.ListaIdsProductos == null) throw new BusinessRuleException("Lista de ids vacia");
            if (infoPago.IdVisita == Guid.Empty) throw new BusinessRuleException("IdVisita vacio");
            if (infoPago.MontoAbonado <= 0) throw new BusinessRuleException("Monto abonado inválido");
            if (infoPago.GenerarFactura && infoPago.DatosFacturaARCA == null) throw new BusinessRuleException("Datos de factura vacios");

            var visita = await _visitasRepository.BuscarVisitaPorId(infoPago.IdVisita);
            if (visita == null) throw new NotFoundException("Visita no encontrada");
            if (visita.Estado == "Cerrada") throw new ConflictException("La visita ya fue cerrada");


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

            decimal TotalAPagar =
                visita.Origen == "Delivery" || visita.Origen == "Takeaway" ?
                await CalcularTotalDeliveryTakeaway(visita,movimientoCaja.Id)
                :
                await CalcularTotalProductos(infoPago.ListaIdsProductos, visita, movimientoCaja.Id);
            visita.Total = TotalAPagar - infoPago.descuentoDecimal + infoPago.recargoDecimal; //TODO: REVISAR

            if (infoPago.MontoAbonado < TotalAPagar) throw new BusinessRuleException("Monto insuficiente");
            movimientoCaja.MontoAbonado = infoPago.MontoAbonado;
            movimientoCaja.Vuelto = CalcularVuelto(TotalAPagar, movimientoCaja);
            movimientoCaja.MontoTotal = visita.Total;

            var (ResultadoPagoCreado, FacturaElectronica) = await _pagosRepository.CrearPago(visita, movimientoCaja, infoPago.DatosFacturaARCA, TotalAPagar, infoPago.GenerarFactura, infoPago.MontoAbonado);
            return (ResultadoPagoCreado, FacturaElectronica);
        }


        private async Task<decimal> CalcularTotalDeliveryTakeaway(Visita visita, Guid IdMovimientoCaja)
        {
            //RECORDATORIO: en caso de DyTKW,la funcion de crearPago solo se llama con todos los productos de la visita, por lo que el envio
            //solo se cobra una vez, no pueden existir multiples pagos del mismo  DyTKW
            var deliveryTakeaway = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorIdVisita(visita.Id);
            if (deliveryTakeaway == null) throw new NotFoundException("No se encontró el registro de Delivery/Takeaway asociado a esta visita");
            deliveryTakeaway.Visita.Estado = "Cerrada";
            foreach (var item in deliveryTakeaway.Visita.Productos)
            {
                item.EstadoPagado = true;
                item.IdMovimientoCaja = IdMovimientoCaja;
            }
            return deliveryTakeaway.PrecioTotal;
        }

        private async Task<decimal> CalcularTotalProductos(ICollection<int> IdProductos, Visita visita, Guid IdMovimientoCaja)
        {
            decimal TotalAPagar = 0;
            foreach (int id in IdProductos)
            {
                var productoPorVisita = visita.Productos.FirstOrDefault(p => p.Id == id);
                if (productoPorVisita != null)
                {
                    if (productoPorVisita.EstadoPagado) throw new ConflictException("Producto ya pagado");
                    TotalAPagar = TotalAPagar + productoPorVisita.PrecioDelMomento; // TODO: Verificar si se debe sumar el IVA o no
                    productoPorVisita.IdMovimientoCaja = IdMovimientoCaja;
                    productoPorVisita.EstadoPagado = true;
                }
            }
            return TotalAPagar;
        }

        private decimal CalcularVuelto(decimal totalAPagar, MovimientoCaja movimientoCaja)
        {
            var vuelto = movimientoCaja.MontoAbonado - totalAPagar;
            var vueltoFormateado = vuelto.ToString("N2", CultureInfo.GetCultureInfo("es-AR"));
            var AbonadoFormateado = movimientoCaja.MontoAbonado.ToString("N2", CultureInfo.GetCultureInfo("es-AR"));
            movimientoCaja.Descripcion = $"{movimientoCaja.Descripcion} | Abonado: $ {AbonadoFormateado} | Vuelto: $ {vueltoFormateado}";
            return vuelto;

        }
    }
}