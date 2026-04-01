using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IDeliveryTakeawayRepository
    {
        Task<IEnumerable<DeliveryAndTakeaway>> ObtenerPorIdSucursal(Guid idSucursal);
        Task<DeliveryAndTakeaway?> ObtenerDeliveryTakeawayPorId(Guid id);
        Task<DeliveryAndTakeaway?> ObtenerDeliveryTakeawayPorIdVisita(Guid IdVisita);
        Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(DeliveryAndTakeaway deliveryTakeaway, Visita visita);
        Task<DeliveryAndTakeaway?> ModificarDeliveryTakeaway(DeliveryAndTakeaway deliveryTakeaway);
        Task<decimal> GetPrecioEnvioPorId(int? id);
        Task<bool> EliminarDeliveryTakeaway(DeliveryAndTakeaway IdDeliveryTakeaway);
    }
}
