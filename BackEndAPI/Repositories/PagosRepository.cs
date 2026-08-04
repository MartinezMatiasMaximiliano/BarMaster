using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using BackEndAPI.ARCA.Servicios;
using BackEndAPI.ARCA.Clases;

namespace BackEndAPI.Repositories
{
    public class PagosRepository : IPagosRepository
    {
        private readonly WsfeService _wsfeService;
        private readonly WsaaAuthService _wsaaAuthService;
        private readonly ICurrentDbContext _context;
        private readonly AppDbContext Db;

        public PagosRepository(ICurrentDbContext context, WsfeService wsfeService, WsaaAuthService wsaaAuthService)
        {
            _context = context;
            _wsfeService = wsfeService;
            _wsaaAuthService = wsaaAuthService;
            Db = _context.Db;
        }

        public async Task<(MovimientoCaja, FacturaElectronica)> CrearPago(Visita visita, MovimientoCaja movimientoCaja, DatosParaFactura DatosFactura, decimal totalProductosPagados, bool generarFactura)
        {
            var transaccion = Db.Database.BeginTransaction();
            var tipoMovimientoCaja = await Db.TipoMovimientosCajas.FirstOrDefaultAsync(tp => tp.Id == movimientoCaja.IdTipoMovimientoCaja);
            if (tipoMovimientoCaja == null) throw new Exception("Tipo de movimiento de caja no encontrado");

            try
            {
                await Db.MovimientosCajas.AddAsync(movimientoCaja);
                Db.Entry(visita).State = EntityState.Modified;

                if (tipoMovimientoCaja.EsEfectivo)
                {
                    var vuelto = Math.Max(0, montoRecibido - pago.Monto);
                    var vueltoFormateado = vuelto.ToString("N2", CultureInfo.GetCultureInfo("es-AR"));
                    pago.Descripcion = $"{pago.Descripcion} | Vuelto: $ {vueltoFormateado}";

                    var caja = await Db.Cajas.FirstOrDefaultAsync(c => c.Id == visita.IdCaja);
                    caja.MontoActual += movimientoCaja.Monto;
                    Db.Entry(caja).State = EntityState.Modified;
                }

                if (generarFactura)
                {
                    var facturaElectronica = await _wsfeService.CrearFacturaElectronica(DatosFactura);
                    await Db.SaveChangesAsync();
                    await transaccion.CommitAsync();
                    return (movimientoCaja, facturaElectronica);
                }
                await Db.SaveChangesAsync();
                await transaccion.CommitAsync();
                return (movimientoCaja, null);

            }
            catch (Exception ex)
            {
                await transaccion.RollbackAsync();
                throw new Exception("Error al crear el pago");
            }

        }

    }
}
