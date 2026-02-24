using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IDeliveryTakeawayServices
    {
        Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(Guid Idsucursal, CrearDeliveryTakeawayDTO request);
        Task<DeliveryAndTakeaway?> ObtenerDeliveryTakeawayPorId(Guid IdDeliveryTakeaway);
        Task<IEnumerable<DeliveryAndTakeaway>?> GetDeliveryTakeaway(Guid IdSucursal);
    }
}
