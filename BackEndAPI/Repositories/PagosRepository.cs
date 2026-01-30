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

        public async Task<Pago> CrearPago(Visita visita,Pago pago)
        {
            var transaccion = Db.Database.BeginTransaction();
            var tipoPago = await Db.TipoPagos.FirstOrDefaultAsync(tp => tp.Id == pago.IdTipoPago);
            try
            {
                await Db.Pagos.AddAsync(pago);
                Db.Entry(visita).State = EntityState.Modified;

                if (tipoPago.Nombre == "Efectivo")
                {
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
