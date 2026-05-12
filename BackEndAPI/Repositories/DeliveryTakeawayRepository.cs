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

        public DeliveryTakeawayRepository(ICurrentDbContext context)
        {
            _context = context;
            Db = context.Db;
        }

        public async Task<IEnumerable<DeliveryAndTakeaway>> ObtenerPorIdSucursal(Guid idSucursal)
        {
            return await Db.DeliveriesTakeaways
                .Include(d => d.Visita)
                .ThenInclude(v => v.Productos)
                .Where(d => d.IdSucursal == idSucursal)
                .ToListAsync();
        }
        public async Task<DeliveryAndTakeaway?> ObtenerDeliveryTakeawayPorId(Guid id)
        {
            return await Db.DeliveriesTakeaways
                 .Include(d => d.Visita)
                 .ThenInclude(v => v.Productos)
                 .FirstOrDefaultAsync(d => d.Id == id);
        }
        public async Task<DeliveryAndTakeaway?> ObtenerDeliveryTakeawayPorIdVisita(Guid IdVisita)
        {
            return await Db.DeliveriesTakeaways
                 .Include(d => d.Visita)
                 .ThenInclude(v => v.Productos)
                 .FirstOrDefaultAsync(d => d.IdVisita == IdVisita);
        }
        public async Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(DeliveryAndTakeaway deliveryAndTakeaway, Visita visita)
        {
            var transaccion = await Db.Database.BeginTransactionAsync();
            try
            {
                await Db.Visitas.AddAsync(visita);
                await Db.DeliveriesTakeaways.AddAsync(deliveryAndTakeaway);
                await Db.SaveChangesAsync();

                transaccion.Commit();
                return deliveryAndTakeaway;
            }
            catch (Exception ex)
            {
                transaccion.Rollback();
                throw new Exception("Error al crear el pedido: " + ex.Message);

            }
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
            // Eliminar explícitamente la Visita asociada (el FK está en DeliveryAndTakeaway: IdVisita)
            using var transaccion = await Db.Database.BeginTransactionAsync();
            try
            {
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
                await transaccion.CommitAsync();
                return true;
            }
            catch
            {
                await transaccion.RollbackAsync();
                throw;
            }
        }
    }
}
