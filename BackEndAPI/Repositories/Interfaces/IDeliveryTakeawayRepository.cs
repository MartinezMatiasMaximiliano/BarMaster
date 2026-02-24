using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IDeliveryTakeawayRepository
    {
        Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(DeliveryAndTakeaway deliveryTakeaway,Visita visita);
        Task<DeliveryAndTakeaway?> ObtenerDeliveryTakeawayPorId(Guid id);
        Task<IEnumerable<DeliveryAndTakeaway>> ObtenerPorIdSucursal(Guid idSucursal);
    }
}
