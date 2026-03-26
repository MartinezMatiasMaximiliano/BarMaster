using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IDeliveryTakeawayServices
    {
        Task<IEnumerable<DeliveryAndTakeaway>?> GetListaDeliveryTakeaways(Guid IdSucursal);
        Task<DeliveryAndTakeaway?> ObtenerDeliveryTakeawayPorId(Guid IdDeliveryTakeaway);
        Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(Guid Idsucursal, CrearDeliveryTakeawayDTO request);
        Task<DeliveryAndTakeaway?> MarcarComoEntregado(Guid IdDeliveryTakeaway);
        Task<DeliveryAndTakeaway?> ModificarDatosDeliveryTakeaway(Guid IdDeliveryTakeaway, ModificarDeliveryTakeawayDTO request);
        Task<bool> EliminarDeliveryTakeaway(Guid IdDeliveryTakeaway);

    }
}
