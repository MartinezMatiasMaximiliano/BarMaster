using BackEndAPI.ARCA.Clases;
using BackEndAPI.ARCA.Servicios;
using BackEndAPI.Data;
using BackEndAPI.Exceptions;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace BackEndAPI.Repositories
{
    public class PagosRepository : IPagosRepository
    {
        private readonly WsfeService _wsfeService;
        private readonly WsaaAuthService _wsaaAuthService;
        private readonly ICurrentDbContext _context;
        private readonly AppDbContext Db;
        private readonly ICajasRepository _cajasRepository;

        public PagosRepository(ICurrentDbContext context, WsfeService wsfeService, WsaaAuthService wsaaAuthService, ICajasRepository cajasRepository)
        {
            _context = context;
            _wsfeService = wsfeService;
            _wsaaAuthService = wsaaAuthService;
            Db = _context.Db;
            _cajasRepository = cajasRepository;
        }

        public async Task<(MovimientoCaja, FacturaElectronica)> CrearPago(Visita visita, MovimientoCaja movimientoCaja, DatosParaFactura DatosFactura, MontosComprobante? montosFactura, decimal totalProductosPagados, bool generarFactura, decimal montoAbonado)
        {
            var transaccion = Db.Database.BeginTransaction();
            var tipoMovimientoCaja = await Db.TipoMovimientosCajas.FirstOrDefaultAsync(tp => tp.Id == movimientoCaja.IdTipoMovimientoCaja);
            if (tipoMovimientoCaja == null) throw new NotFoundException("Tipo de movimiento de caja no encontrado");

            try
            {

                if (tipoMovimientoCaja.EsEfectivo)
                {
                    var caja = await _cajasRepository.GetCajaPorId(visita.IdCaja);
                    caja.MontoActual += totalProductosPagados;
                    Db.Entry(caja).State = EntityState.Modified;
                }

                if (generarFactura)
                {
                    if (montosFactura == null) throw new BusinessRuleException("No se pudieron calcular los montos del comprobante");
                    var facturaElectronica = await _wsfeService.CrearFacturaElectronica(DatosFactura, montosFactura);
                    movimientoCaja.Facturado = true;
                    movimientoCaja.IdFactura = facturaElectronica.Id;

                    await Db.MovimientosCajas.AddAsync(movimientoCaja);
                    Db.Entry(visita).State = EntityState.Modified;
                    await Db.SaveChangesAsync();
                    await transaccion.CommitAsync();
                    return (movimientoCaja, facturaElectronica);
                }
                movimientoCaja.Facturado = false;

                await Db.MovimientosCajas.AddAsync(movimientoCaja);
                Db.Entry(visita).State = EntityState.Modified;

                await Db.SaveChangesAsync();
                await transaccion.CommitAsync();
                return (movimientoCaja, null);

            }
            catch (Exception)
            {
                await transaccion.RollbackAsync();
                throw;
            }
        }
    }
}
