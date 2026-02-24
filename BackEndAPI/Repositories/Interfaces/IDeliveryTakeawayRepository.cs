using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IDeliveryTakeawayRepository
    {
        Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(DeliveryAndTakeaway deliveryTakeaway,Visita visita);
    }
}
