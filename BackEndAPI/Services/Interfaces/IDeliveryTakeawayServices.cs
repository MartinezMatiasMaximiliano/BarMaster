using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using System.Transactions;

namespace BackEndAPI.Services.Interfaces
{
    public interface IDeliveryTakeawayServices
    {
        Task<IEnumerable<DeliveryAndTakeaway>?> GetListaDeliveryTakeaways(Guid IdSucursal);
        Task<IEnumerable<DeliveryAndTakeaway>?> GetListaDeliveryTakeawaysPorCaja(Guid IdSucursal, Guid IdCaja);
        Task<DeliveryAndTakeaway?> ObtenerDeliveryTakeawayPorId(Guid IdDeliveryTakeaway);
        Task<DeliveryAndTakeaway?> CrearDeliveryTakeaway(Guid Idsucursal, CrearDeliveryTakeawayDTO request);
        Task<DeliveryAndTakeaway?> MarcarComoEntregado(Guid IdDeliveryTakeaway);
        Task<DeliveryAndTakeaway?> ModificarDeliveryTakeaway(ModificarDeliveryTakeawayDTO request);
        //Task<DeliveryAndTakeaway?> AgregarProductosADeliveryAndTakeaway(Guid Id, List<AgregarProductoAVisita> ListaProductos);
        //Task<DeliveryAndTakeaway?> RemoverProductosADeliveryAndTakeaway(Guid Id, List<int> ListaProductos);
        Task<bool> EliminarDeliveryTakeaway(Guid IdDeliveryTakeaway);

    }
}
