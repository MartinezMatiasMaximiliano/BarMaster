using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IStockServices
    {
        Task<IReadOnlyCollection<StockProductoDTO>> ObtenerStockAsync(Guid idSucursal);
        Task<IReadOnlyCollection<MovimientoStockDTO>> ObtenerMovimientosAsync(Guid idProducto, Guid idSucursal);
        Task<StockProductoDTO> ConfigurarAsync(Guid idProducto, Guid idSucursal, ConfigurarStockDTO request);
        Task<StockProductoDTO> RegistrarMovimientoAsync(Guid idProducto, Guid idSucursal, RegistrarMovimientoStockDTO request);
        Task DescontarVentaAsync(Guid idSucursal, IReadOnlyDictionary<Guid, int> productos, Guid idVisita, CanalMovimientoStock canal);
        Task ReponerVentaAsync(Guid idSucursal, IReadOnlyDictionary<Guid, int> productos, Guid idVisita, CanalMovimientoStock canal);
    }
}
