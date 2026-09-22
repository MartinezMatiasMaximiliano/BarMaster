using BackEndAPI.ARCA.Clases;
using BackEndAPI.ARCA.Servicios;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Exceptions;
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
            if (infoPago.ListaIdsProductos == null) throw new BusinessRuleException("Lista de ids vacia");
            if (infoPago.IdVisita == Guid.Empty) throw new BusinessRuleException("IdVisita vacio");
            if (infoPago.MontoAbonado <= 0) throw new BusinessRuleException("Monto abonado inválido");
            if (infoPago.GenerarFactura && infoPago.DatosFacturaARCA == null) throw new BusinessRuleException("Datos de factura vacios");

            var visita = await _visitasRepository.BuscarVisitaPorId(infoPago.IdVisita);
            if (visita == null) throw new NotFoundException("Visita no encontrada");
            if (visita.Estado == "Cerrada" && visita.Origen == "Local") throw new ConflictException("La visita ya fue cerrada");


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
            if (productos.Count == 0 || (!esPedido && productos.Count != ids.Length)) throw new NotFoundException("Lista de ids vacia");
            if (productos.Any(p => p.EstadoPagado)) throw new BusinessRuleException("Producto ya pagado");
            decimal subtotal = productos.Sum(p => p.PrecioDelMomento);
            if (esPedido)
            {
                var pedido = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorIdVisita(visita.Id);
                if (pedido == null) throw new NotFoundException("delivery id no encontrado");
                subtotal = pedido.PrecioTotal;
            }
            if (infoPago.descuentoDecimal < 0 || infoPago.descuentoDecimal > subtotal || infoPago.recargoDecimal < 0)
                throw new BusinessRuleException("Descuento o recargo inválido");
            decimal TotalAPagar = subtotal - infoPago.descuentoDecimal + infoPago.recargoDecimal;
            if (infoPago.MontoAbonado < 0 || infoPago.MontoAbonado < TotalAPagar) throw new BusinessRuleException("Monto insuficiente");

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
            var montosFactura = infoPago.GenerarFactura ? CalcularMontosComprobante(productos, TotalAPagar) : null;

            var (ResultadoPagoCreado, FacturaElectronica) = await _pagosRepository.CrearPago(
                visita, movimientoCaja, infoPago.DatosFacturaARCA, montosFactura, TotalAPagar, infoPago.GenerarFactura, infoPago.MontoAbonado);
            try
            {
                await _servicioDocumentoImpresion.EncolarComprobantePagoAsync(visita, productos,
                    ResultadoPagoCreado, CancellationToken.None, infoPago.descuentoDecimal, infoPago.recargoDecimal);
            }
            catch (Exception exception)
            {
                _logger.LogWarning(exception, "No se pudo encolar el comprobante del pago {IdPago}.", ResultadoPagoCreado.Id);
            }
            return (ResultadoPagoCreado, FacturaElectronica);
        }


        private async Task<(decimal Total, List<ProductosPorVisita> Items)> CalcularTotalDeliveryTakeaway(Visita visita, Guid IdMovimientoCaja)
        {
            //RECORDATORIO: en caso de DyTKW,la funcion de crearPago solo se llama con todos los productos de la visita, por lo que el envio
            //solo se cobra una vez, no pueden existir multiples pagos del mismo  DyTKW
            var deliveryTakeaway = await _deliveryTakeawayRepository.ObtenerDeliveryTakeawayPorIdVisita(visita.Id);
            if (deliveryTakeaway == null) throw new NotFoundException("No se encontró el registro de Delivery/Takeaway asociado a esta visita");
            deliveryTakeaway.Visita.Estado = "Cerrada";
            foreach (var item in deliveryTakeaway.Visita.Productos)
            {
                // El pago ya fue confirmado: un problema de impresión no debe informarlo como fallido ni duplicarlo al reintentar.
                //_logger.LogWarning(exception, "No se pudo encolar el comprobante del pago {IdPago}.", ResultadoPagoCreado.Id);
            }
            // OJO: PrecioEnvio queda afuera del desglose de IVA de la factura (no hay un
            // producto/alícuota asociado) — por ahora se suma al ImpNeto general al facturar,
            // ver CalcularMontosComprobante.
            return (deliveryTakeaway.PrecioTotal, deliveryTakeaway.Visita.Productos.ToList());
        }

        private async Task<(decimal Total, List<ProductosPorVisita> Items)> CalcularTotalProductos(ICollection<int> IdProductos, Visita visita, Guid IdMovimientoCaja)
        {
            decimal TotalAPagar = 0;
            var items = new List<ProductosPorVisita>();
            foreach (int id in IdProductos)
            {
                var productoPorVisita = visita.Productos.FirstOrDefault(p => p.Id == id);
                if (productoPorVisita != null)
                {
                    if (productoPorVisita.EstadoPagado) throw new ConflictException("Producto ya pagado");
                    TotalAPagar = TotalAPagar + productoPorVisita.PrecioDelMomento;
                    productoPorVisita.IdMovimientoCaja = IdMovimientoCaja;
                    productoPorVisita.EstadoPagado = true;
                    items.Add(productoPorVisita);
                }
            }
            return (TotalAPagar, items);
        }

        /// <summary>
        /// Calcula Neto/IVA/Total para la factura electrónica a partir de los productos que se
        /// están pagando.
        ///
        /// ⚠️ PENDIENTE DE CONFIRMAR (queda como tarea aparte, no resuelto en esta pasada):
        /// se asume que <see cref="ProductosPorVisita.PrecioDelMomento"/> es el precio final
        /// que paga el cliente CON IVA incluido — es la única lectura consistente con que hoy,
        /// en todo el sistema de pagos (Visitas, DeliveryTakeaway, Pagos), nunca se suma IVA
        /// arriba de ese precio antes de cobrarlo. El nombre del campo origen
        /// (<see cref="Producto.PrecioNeto"/>) sugiere lo contrario (precio ANTES de IVA), así
        /// que si en algún momento se confirma que el precio debería cobrarse SIN IVA incluido
        /// (agregándolo al momento de pagar), esto hay que revisarlo junto con el cálculo de
        /// <c>TotalAPagar</c>/<c>Visita.Total</c> en este mismo archivo — no es solo un cambio
        /// acá, cambiaría cuánto se le cobra al cliente en toda la app.
        ///
        /// Con la asunción actual, el neto se calcula "para atrás": Neto = Precio / (1 + %/100).
        /// Esto asume Concepto=1 (venta de productos, no servicios) y no prorratea
        /// descuentoDecimal/recargoDecimal de <see cref="DTOs.Request.Crear.CrearPagoDTO"/> —
        /// quedan fuera del comprobante fiscal hasta que se defina cómo deben reflejarse ahí.
        /// </summary>
        private static MontosComprobante CalcularMontosComprobante(IEnumerable<ProductosPorVisita> items, decimal totalCobrado)
        {
            var montos = new MontosComprobante();
            var totalProductos = items.Sum(i => i.PrecioDelMomento);
            var factor = totalProductos == 0 ? 1 : totalCobrado / totalProductos;

            foreach (var grupo in items.GroupBy(i => i.IVADelMomento))
            {
                var precioConIva = grupo.Sum(i => i.PrecioDelMomento) * factor;
                var neto = grupo.Key == 0
                    ? precioConIva
                    : Math.Round(precioConIva / (1 + grupo.Key / 100m), 2);
                var iva = precioConIva - neto;

                montos.ImpNeto += neto;
                montos.ImpIVA += iva;

                if (grupo.Key > 0)
                {
                    montos.DetalleIva.Add(new DetalleIva
                    {
                        AlicuotaId = AlicuotasIva.ObtenerId(grupo.Key),
                        BaseImponible = neto,
                        Importe = iva
                    });
                }
                else
                {
                    // 0% igual necesita su renglón en <Iva> si hay OTRAS alícuotas en el mismo
                    // comprobante (mixto) — si es el único grupo (todo al 0%), FECAERequest.Iva
                    // queda vacío más abajo y ImpIVA=0 alcanza (ej. Factura C).
                }
            }

            montos.ImpNeto = Math.Round(montos.ImpNeto, 2);
            montos.ImpIVA = totalCobrado - montos.ImpNeto;
            montos.ImpTotal = totalCobrado;
            return montos;
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
