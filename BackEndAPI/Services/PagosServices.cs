using BackEndAPI.ARCA.Servicios;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity.Data;
using System.Runtime.CompilerServices;

namespace BackEndAPI.Services
{
    public class PagosServices : IPagosServices
    {
        private readonly IVisitasRepository _visitasRepository;
        private readonly IPagosRepository _pagosRepository;
        private readonly WsfeService _wsfeService;
        private readonly WsaaAuthService _wasaaAuthService;

        public PagosServices(IVisitasRepository visitasRepository, IPagosRepository pagosRepository, WsfeService wsfeService, WsaaAuthService wsaaAuthService)
        {
            _visitasRepository = visitasRepository;
            _pagosRepository = pagosRepository;
            _wsfeService = wsfeService;
            _wasaaAuthService = wsaaAuthService;
        }

        public async Task<MovimientoCaja> PagarProductos(CrearPagoDTO infoPago, bool emitirFactura, bool marcarPago)
        {
            decimal TotalAPagar = 0;

            var visita = await _visitasRepository.BuscarVisitaPorId(infoPago.IdVisita);

            if (visita == null) throw new Exception("Visita no encontrada");
            
            var origen = string.IsNullOrWhiteSpace(visita.Origen) ? "Local" : visita.Origen;
            var descripcion = visita.Mesa != null
                ? $"Pago de la mesa {visita.Mesa.Nombre}" : $"Pago de {origen}";

            var PagoCreado = new MovimientoCaja
            {
                IdTipoMovimientoCaja = infoPago.IdTipoMovimiento,
                IdCaja = visita.IdCaja,
                IdVisita = infoPago.IdVisita,
                Monto = infoPago.Monto,
                Descripcion = visita.Mesa != null
                    ? $"Pago de la mesa {visita.Mesa.Nombre}"
                    : $"Pago de {visita.Origen}"
            };

            foreach (var id in infoPago.ListaIdsProductos)
            {
                var productoPorVisita = visita.Productos.FirstOrDefault(p => p.Id == id);
                if (productoPorVisita != null)
                {
                    TotalAPagar = TotalAPagar + productoPorVisita.PrecioDelMomento;
                    productoPorVisita.EstadoPagado = true;
                    productoPorVisita.IdMovimientoCaja = PagoCreado.Id;
                }
            }

            visita.Total += TotalAPagar;

            if (infoPago.Monto < TotalAPagar) throw new Exception("Monto insuficiente");

            var resultado =  await _pagosRepository.CrearPago(visita, PagoCreado, TotalAPagar);

            //if (emitirFactura)
            //{
            //    var factura = await _wsfeService.CrearFacturaElectronica(infoPago.DatosFacturaARCA, authResponse);
            //    var authResponse = await _wasaaAuthService.AutenticarFacturacionElectronica(cert);
            //    if(authResponse != null)
            //    {
            //        var facturaResponse = await _wsfeService.CrearFacturaElectronica(infoPago.DatosFacturaARCA, authResponse);
            //        if (facturaResponse != null)
            //        {
            //            // Aquí puedes manejar la respuesta de la factura, como guardar el CAE o cualquier otra información relevante
            //        }
            //    }
            //    else {
            //        throw new Exception();
            //    }

                
            //}

            return resultado;
        }
    }
}

