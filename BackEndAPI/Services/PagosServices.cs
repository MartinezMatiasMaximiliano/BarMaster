using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity.Data;

namespace BackEndAPI.Services
{
    public class PagosServices : IPagosServices
    {
        private readonly IVisitasRepository _visitasRepository;
        private readonly IPagosRepository _pagosRepository;

        public PagosServices(IVisitasRepository visitasRepository, IPagosRepository pagosRepository)
        {
            _visitasRepository = visitasRepository;
            _pagosRepository = pagosRepository;
        }

        public async Task<MovimientoCaja> PagarProductos(CrearPagoDTO InfoPago)
        {
            decimal TotalProductosAPagar = 0;
            if (InfoPago.ListaIdsProductos == null || InfoPago.ListaIdsProductos.Count <= 0)
            {
                throw new Exception("Lista de ids vacia");
            }
            if (InfoPago.IdVisita == Guid.Empty)
            {
                throw new Exception("IdVisita vacio");
            }
            var visita = await _visitasRepository.BuscarVisitaPorId(InfoPago.IdVisita);
            if (visita == null)
            {
                throw new Exception("Visita no encontrada");
            }

            var PagoCreado = new MovimientoCaja
            {
                IdTipoMovimientoCaja = InfoPago.IdTipoMovimiento,
                IdCaja = visita.IdCaja,
                IdVisita = InfoPago.IdVisita,
                Monto = InfoPago.Monto,
                Descripcion = $"Pago por productos de la visita con id {InfoPago.IdVisita}"
            };

            foreach (var id in InfoPago.ListaIdsProductos)
            {
                var productoPorVisita = visita.Productos.FirstOrDefault(p => p.Id == id);
                if (productoPorVisita != null)
                {
                    TotalProductosAPagar = TotalProductosAPagar + productoPorVisita.PrecioDelMomento;
                    productoPorVisita.EstadoPagado = true;
                    productoPorVisita.IdMovimientoCaja = PagoCreado.Id;
                }
            }

            visita.Total += TotalProductosAPagar;

            if (InfoPago.Monto < TotalProductosAPagar)
            {
                throw new Exception("Monto insuficiente");
            }
            return await _pagosRepository.CrearPago(visita, PagoCreado, TotalProductosAPagar);
        }
    }
}
