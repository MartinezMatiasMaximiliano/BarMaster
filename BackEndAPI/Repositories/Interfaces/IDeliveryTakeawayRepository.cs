using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IDeliveryTakeawayRepository
    {
        Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(DeliveryAndTakeaway deliveryTakeaway, Visita visita);
        Task<DeliveryAndTakeaway?> ObtenerDeliveryTakeawayPorId(Guid id);
        Task<IEnumerable<DeliveryAndTakeaway>> ObtenerPorIdSucursal(Guid idSucursal);
        /// Devuelve el precio del tipo de envío, o 0 si id es null o no existe
        Task<decimal> GetPrecioEnvioPorId(int? id);
    }
}
