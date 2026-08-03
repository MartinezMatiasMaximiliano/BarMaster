using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;
using Mono.TextTemplating;

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

        public async Task<MovimientoCaja> CrearPago(Visita visita, MovimientoCaja pago, decimal totalProductosPagados)
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
                    var caja = await Db.Cajas.FirstOrDefaultAsync(c => c.Id == visita.IdCaja);
                    caja.MontoActual += pago.totalProductosPagados;
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
