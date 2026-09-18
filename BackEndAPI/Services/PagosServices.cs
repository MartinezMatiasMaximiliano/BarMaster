using BackEndAPI.ARCA.Clases;
using BackEndAPI.ARCA.Servicios;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using System.Globalization;
using System.Security.Cryptography.X509Certificates;
using BackEndAPI.Impresion.Documentos;

namespace BackEndAPI.Services
{
    public class PagosServices : IPagosServices
    {
        private readonly IVisitasRepository _visitasRepository;
        private readonly IPagosRepository _pagosRepository;
        private readonly IDeliveryTakeawayRepository _deliveryTakeawayRepository;
        private readonly IServicioDocumentoImpresion _servicioDocumentoImpresion;
        private readonly ILogger<PagosServices> _logger;

        public PagosServices(IVisitasRepository visitasRepository, IPagosRepository pagosRepository, IDeliveryTakeawayRepository deliveryTakeawayRepository, IServicioDocumentoImpresion servicioDocumentoImpresion, ILogger<PagosServices> logger)
        {
            _visitasRepository = visitasRepository;
            _pagosRepository = pagosRepository;
            _deliveryTakeawayRepository = deliveryTakeawayRepository;
            _servicioDocumentoImpresion = servicioDocumentoImpresion;
            _logger = logger;
        }

        public async Task<(MovimientoCaja, FacturaElectronica?)> PagarProductos(CrearPagoDTO infoPago)
        {
            var visita = await _visitasRepository.BuscarVisitaPorId(infoPago.IdVisita);
            if (visita == null) throw new Exception("Visita no encontrada");
            if (visita.Estado == "Cerrada" && !(visita.Origen is "Delivery" or "Takeaway" && visita.Productos.Any(p => !p.EstadoPagado))) throw new Exception("La visita ya fue cerrada");


            var movimientoCaja = new MovimientoCaja
            {
                IdTipoMovimientoCaja = infoPago.IdTipoMovimiento,
                IdCaja = visita.IdCaja,
                IdVisita = infoPago.IdVisita,
                Facturado = infoPago.GenerarFactura,
                Descripcion = visita.Origen == "Local" ?
                 $"Pago de mesa {(visita.Mesa != null ? visita.Mesa.Numero.ToString() : "")}"
                  :
                 $"Pago de {visita.Origen}"
            };

            var esPedido = visita.Origen is "Delivery" or "Takeaway";
            var ids = infoPago.ListaIdsProductos?.Distinct().ToArray() ?? [];
            var productos = esPedido ? visita.Productos.ToList() : visita.Productos.Where(p => ids.Contains(p.Id)).ToList();
            if (productos.Count == 0 || (!esPedido && productos.Count != ids.Length)) throw new Exception("Lista de ids vacia");
            if (productos.Any(p => p.EstadoPagado)) throw new Exception("Producto ya pagado");
            decimal subtotal = productos.Sum(p => p.PrecioDelMomento);
            if (esPedido)
            {
                var pedido = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorIdVisita(visita.Id);
                if (pedido == null) throw new Exception("delivery id no encontrado");
                subtotal = pedido.PrecioTotal;
            }
            if (infoPago.descuentoDecimal < 0 || infoPago.descuentoDecimal > subtotal || infoPago.recargoDecimal < 0)
                throw new Exception("Descuento o recargo inválido");
            decimal TotalAPagar = subtotal - infoPago.descuentoDecimal + infoPago.recargoDecimal;
            if (infoPago.MontoAbonado < 0 || infoPago.MontoAbonado < TotalAPagar) throw new Exception("Monto insuficiente");

            // Validar antes de alterar entidades seguidas por EF.
            foreach (var producto in productos)
            {
                producto.EstadoPagado = true;
                producto.IdMovimientoCaja = movimientoCaja.Id;
            }
            if (esPedido) visita.Estado = "Cerrada";
            visita.Total = esPedido ? TotalAPagar : visita.Total - infoPago.descuentoDecimal + infoPago.recargoDecimal;
            movimientoCaja.MontoAbonado = infoPago.MontoAbonado;
            movimientoCaja.Vuelto = CalcularVuelto(TotalAPagar, movimientoCaja);
            movimientoCaja.MontoTotal = TotalAPagar;

            var (ResultadoPagoCreado, FacturaElectronica) = await _pagosRepository.CrearPago(visita, movimientoCaja, infoPago.DatosFacturaARCA, TotalAPagar, infoPago.GenerarFactura, infoPago.MontoAbonado);
            try
            {
                await _servicioDocumentoImpresion.EncolarComprobantePagoAsync(visita, productos, ResultadoPagoCreado, CancellationToken.None,
                    infoPago.descuentoDecimal, infoPago.recargoDecimal);
            }
            catch (Exception exception)
            {
                // El pago ya fue confirmado: un problema de impresión no debe informarlo como fallido ni duplicarlo al reintentar.
                _logger.LogWarning(exception, "No se pudo encolar el comprobante del pago {IdPago}.", ResultadoPagoCreado.Id);
            }
            return (ResultadoPagoCreado, FacturaElectronica);
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

