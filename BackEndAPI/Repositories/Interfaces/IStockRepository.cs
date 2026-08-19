using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IStockRepository
    {
        Task<IReadOnlyCollection<StockProductoSucursal>> ObtenerStockAsync(Guid idSucursal);
        Task<IReadOnlyCollection<MovimientoStock>> ObtenerMovimientosAsync(Guid idProducto, Guid idSucursal);
        Task<StockProductoSucursal> ConfigurarAsync(Guid idProducto, Guid idSucursal, bool controlaStock, bool enviarAlerta, int cantidadMinima, int? cantidadInicial);
        Task<StockProductoSucursal> RegistrarMovimientoAsync(Guid idProducto, Guid idSucursal, int cantidad, string? motivo);
        Task AplicarVentaAsync(Guid idSucursal, IReadOnlyDictionary<Guid, int> productos, Guid idVisita, bool reponer, CanalMovimientoStock canal);
    }
}
