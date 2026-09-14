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

            var (TotalAPagar, ProductosPagados) =
                visita.Origen == "Delivery" || visita.Origen == "Takeaway" ?
                await CalcularTotalDeliveryTakeaway(visita, movimientoCaja.Id)
                :
                await CalcularTotalProductos(infoPago.ListaIdsProductos, visita, movimientoCaja.Id);
            visita.Total = TotalAPagar - infoPago.descuentoDecimal + infoPago.recargoDecimal; //TODO: REVISAR

            if (infoPago.MontoAbonado < TotalAPagar) throw new BusinessRuleException("Monto insuficiente");
            movimientoCaja.MontoAbonado = infoPago.MontoAbonado;
            movimientoCaja.Vuelto = CalcularVuelto(TotalAPagar, movimientoCaja);
            movimientoCaja.MontoTotal = visita.Total;
            var montosFactura = infoPago.GenerarFactura ? CalcularMontosComprobante(ProductosPagados) : null;

            var (ResultadoPagoCreado, FacturaElectronica) = await _pagosRepository.CrearPago(
                visita, movimientoCaja, infoPago.DatosFacturaARCA, montosFactura, TotalAPagar, infoPago.GenerarFactura, infoPago.MontoAbonado);
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
                item.EstadoPagado = true;
                item.IdMovimientoCaja = IdMovimientoCaja;
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
        private static MontosComprobante CalcularMontosComprobante(IEnumerable<ProductosPorVisita> items)
        {
            var montos = new MontosComprobante();

            foreach (var grupo in items.GroupBy(i => i.IVADelMomento))
            {
                var precioConIva = grupo.Sum(i => i.PrecioDelMomento);
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

            montos.ImpTotal = montos.ImpNeto + montos.ImpIVA + montos.ImpTotConc + montos.ImpOpEx + montos.ImpTrib;
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
