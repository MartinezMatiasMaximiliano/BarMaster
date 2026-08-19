using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class DeliveryTakeawayRepository : IDeliveryTakeawayRepository
    {
        private readonly ICurrentDbContext _context;
        private readonly AppDbContext Db;
        private readonly IDatabaseTransactionManager _transactionManager;

        public DeliveryTakeawayRepository(
            ICurrentDbContext context,
            IDatabaseTransactionManager transactionManager)
        {
            _context = context;
            Db = context.Db;
            _transactionManager = transactionManager;
        }

        public async Task<IEnumerable<DeliveryAndTakeaway>> ObtenerPorIdSucursal(Guid idSucursal)
        {
            return await Db.DeliveriesTakeaways
                .Include(d => d.Visita)
                .ThenInclude(v => v.Productos)
                .Include(d => d.Visita)
                .ThenInclude(v => v.Pagos)
                .ThenInclude(p => p.TipoMovimientoCaja)
                .Include(e=> e.TipoEnvio)
                .Include(c => c.Cadete)
                .Where(d => d.IdSucursal == idSucursal)
                .AsSplitQuery()
                .ToListAsync();
        }
        public async Task<IEnumerable<DeliveryAndTakeaway>> ObtenerPorIdCaja(Guid idSucursal, Guid idCaja)
        {
            return await Db.DeliveriesTakeaways
                .Include(d => d.Visita)
                .ThenInclude(v => v.Productos)
                .Include(d => d.Visita)
                .ThenInclude(v => v.Pagos)
                .ThenInclude(p => p.TipoMovimientoCaja)
                .Include(e => e.TipoEnvio)
                .Include(c => c.Cadete)
                .Where(d => d.IdSucursal == idSucursal && d.Visita.IdCaja == idCaja)
                .AsSplitQuery()
                .ToListAsync();
        }
        public async Task<DeliveryAndTakeaway?> ObtenerDeliveryTakeawayPorId(Guid id)
        {
            return await Db.DeliveriesTakeaways
                 .Include(d => d.Visita)
                 .ThenInclude(v => v.Productos)
                 .Include(d => d.Visita)
                 .ThenInclude(v => v.Pagos)
                 .ThenInclude(p => p.TipoMovimientoCaja)
                 .Include(e => e.TipoEnvio)
                 .Include(c => c.Cadete)
                 .AsSplitQuery()
                 .FirstOrDefaultAsync(d => d.Id == id);
        }
        public async Task<DeliveryAndTakeaway?> ObtenerDeliveryTakeawayPorIdVisita(Guid IdVisita)
        {
            return await Db.DeliveriesTakeaways
                 .Include(d => d.Visita)
                 .ThenInclude(v => v.Productos)
                 .Include(d => d.Visita)
                 .ThenInclude(v => v.Pagos)
                 .ThenInclude(p => p.TipoMovimientoCaja)
                 .Include(e => e.TipoEnvio)
                 .Include(c => c.Cadete)
                 .AsSplitQuery()
                 .FirstOrDefaultAsync(d => d.IdVisita == IdVisita);
        }
        public async Task<decimal> ObtenerPrecioEnvioPorIdVisita(Guid idVisita)
        {
            return await Db.DeliveriesTakeaways
                .AsNoTracking()
                .Where(d => d.IdVisita == idVisita && d.IdTipoEnvio.HasValue)
                .Select(d => d.TipoEnvio.Precio)
                .FirstOrDefaultAsync();
        }
        public async Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(DeliveryAndTakeaway deliveryAndTakeaway, Visita visita)
        {
            return await _transactionManager.ExecuteAsync<DeliveryAndTakeaway?>(async () =>
            {
                try
                {
                    await Db.Visitas.AddAsync(visita);
                    await Db.DeliveriesTakeaways.AddAsync(deliveryAndTakeaway);
                    await Db.SaveChangesAsync();
                    return deliveryAndTakeaway;
                }
                catch (Exception ex)
                {
                    throw new Exception("Error al crear el pedido: " + ex.Message, ex);
                }
            });
        }
        public async Task<DeliveryAndTakeaway?> ModificarDeliveryTakeaway(DeliveryAndTakeaway deliveryTakeaway)
        {
            Db.Entry(deliveryTakeaway).State = EntityState.Modified;
            await Db.SaveChangesAsync();
            return deliveryTakeaway;
        }
        public async Task<decimal> GetPrecioEnvioPorId(int? id)
        {
            if (!id.HasValue) return 0;
            var tipo = await Db.TipoEnvios.FindAsync(id.Value);
            return tipo?.Precio ?? 0;
        }
        public async Task<bool> EliminarDeliveryTakeaway(DeliveryAndTakeaway deliveryTakeaway)
        {
            return await _transactionManager.ExecuteAsync(async () =>
            {
                // Eliminar explícitamente la Visita asociada (el FK está en DeliveryAndTakeaway: IdVisita)
                if (deliveryTakeaway.IdVisita != Guid.Empty)
                {
                    var visita = await Db.Visitas.FindAsync(deliveryTakeaway.IdVisita);
                    if (visita != null)
                    {
                        Db.Visitas.Remove(visita);
                    }
                }

                Db.DeliveriesTakeaways.Remove(deliveryTakeaway);
                await Db.SaveChangesAsync();
                return true;
            });
        }
    }
}
