using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;

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

        public async Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(DeliveryAndTakeaway deliveryAndTakeaway, Visita visita)
        {
            var transaccion = await Db.Database.BeginTransactionAsync();
            try
            {
                Db.Entry(visita).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
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
    }
}
