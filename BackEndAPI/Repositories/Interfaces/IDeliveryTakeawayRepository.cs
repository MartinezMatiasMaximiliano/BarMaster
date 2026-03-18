using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IDeliveryTakeawayRepository
    {
        Task<IEnumerable<DeliveryAndTakeaway>> ObtenerPorIdSucursal(Guid idSucursal);
        Task<DeliveryAndTakeaway?> ObtenerDeliveryTakeawayPorId(Guid id);
        Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(DeliveryAndTakeaway deliveryTakeaway, Visita visita);
        Task<DeliveryAndTakeaway?> ModificarDatosDeliveryTakeaway(Guid IdDeliveryTakeaway, DeliveryAndTakeaway deliveryTakeaway);
        Task<decimal> GetPrecioEnvioPorId(int? id);
        Task<bool> EliminarDeliveryTakeaway(DeliveryAndTakeaway IdDeliveryTakeaway);
    }
}
