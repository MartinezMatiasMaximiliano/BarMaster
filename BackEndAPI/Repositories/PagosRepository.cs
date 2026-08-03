using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using Mono.TextTemplating;
using System.Globalization;

namespace BackEndAPI.Repositories
{
    public class PagosRepository : IPagosRepository
    {
        private readonly ICurrentDbContext _context;
        private readonly AppDbContext Db;

        public PagosRepository(ICurrentDbContext context)
        {
            _context = context;
            Db = _context.Db;
        }

        public async Task<MovimientoCaja> CrearPago(Visita visita, MovimientoCaja pago, decimal montoRecibido)
        {
            var transaccion = Db.Database.BeginTransaction();
            var tipoMovimientoCaja = await Db.TipoMovimientosCajas.FirstOrDefaultAsync(tp => tp.Id == pago.IdTipoMovimientoCaja);
            if (tipoMovimientoCaja == null)
            {
                throw new Exception("Tipo de movimiento de caja no encontrado");
            }
            try
            {
                await Db.MovimientosCajas.AddAsync(pago);
                Db.Entry(visita).State = EntityState.Modified;

                if (tipoMovimientoCaja.EsEfectivo)
                {
                    var vuelto = Math.Max(0, montoRecibido - pago.Monto);
                    var vueltoFormateado = vuelto.ToString("N2", CultureInfo.GetCultureInfo("es-AR"));
                    pago.Descripcion = $"{pago.Descripcion} | Vuelto: $ {vueltoFormateado}";

                    var caja = await Db.Cajas.FirstOrDefaultAsync(c => c.Id == visita.IdCaja);
                    caja.MontoActual += pago.Monto;
                    Db.Entry(caja).State = EntityState.Modified;
                }

                await Db.SaveChangesAsync();
                await transaccion.CommitAsync();
                return pago;
            }
            catch (Exception ex)
            {
                await transaccion.RollbackAsync();
                throw new Exception("Error al crear el pago");
            }
            
        }

    }
}
