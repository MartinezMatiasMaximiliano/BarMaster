using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class StockServices : IStockServices
    {
        private readonly IStockRepository _stockRepository;
        private readonly IProductosRepository _productosRepository;

        public StockServices(IStockRepository stockRepository, IProductosRepository productosRepository)
        {
            _stockRepository = stockRepository;
            _productosRepository = productosRepository;
        }

        public async Task<IReadOnlyCollection<StockProductoDTO>> ObtenerStockAsync(Guid idSucursal)
        {
            var stock = await _stockRepository.ObtenerStockAsync(idSucursal);
            return stock.Select(MapearStock).ToArray();
        }

        public async Task<IReadOnlyCollection<AlertaStockDTO>> ObtenerAlertasAsync(Guid idSucursal)
        {
            return await _stockRepository.ObtenerAlertasAsync(idSucursal);
        }

        public async Task<IReadOnlyCollection<MovimientoStockDTO>> ObtenerMovimientosAsync(Guid idProducto, Guid idSucursal)
        {
            var movimientos = await _stockRepository.ObtenerMovimientosAsync(idProducto, idSucursal);
            return movimientos.Select(MapearMovimiento).ToArray();
        }

        public async Task<StockProductoDTO> ConfigurarAsync(
            Guid idProducto,
            Guid idSucursal,
            ConfigurarStockDTO request)
        {
            if (request.CantidadMinima < 0) throw new Exception("La cantidad mínima no puede ser negativa");
            if (request.CantidadInicial < 0) throw new Exception("La cantidad inicial no puede ser negativa");

            var producto = await _productosRepository.GetProductoPorId(idProducto)
                ?? throw new Exception("Producto no encontrado");
            var stock = await _stockRepository.ConfigurarAsync(
                idProducto,
                idSucursal,
                request.ControlaStock,
                request.EnviarAlerta,
                request.CantidadMinima,
                request.CantidadInicial);

            stock.Producto = producto;
            return MapearStock(stock);
        }

        public async Task<StockProductoDTO> RegistrarMovimientoAsync(
            Guid idProducto,
            Guid idSucursal,
            RegistrarMovimientoStockDTO request)
        {
            if (request.Cantidad == 0) throw new Exception("La cantidad no puede ser cero");
            var stock = await _stockRepository.RegistrarMovimientoAsync(
                idProducto,
                idSucursal,
                request.Cantidad,
                request.Motivo);
            return MapearStock(stock);
        }

        public Task DescontarVentaAsync(
            Guid idSucursal,
            IReadOnlyDictionary<Guid, int> productos,
            Guid idVisita,
            CanalMovimientoStock canal) =>
            _stockRepository.AplicarVentaAsync(idSucursal, productos, idVisita, false, canal);

        public Task ReponerVentaAsync(
            Guid idSucursal,
            IReadOnlyDictionary<Guid, int> productos,
            Guid idVisita,
            CanalMovimientoStock canal) =>
            _stockRepository.AplicarVentaAsync(idSucursal, productos, idVisita, true, canal);

        private static StockProductoDTO MapearStock(StockProductoSucursal stock)
        {
            return new StockProductoDTO
            {
                IdProducto = stock.IdProducto,
                CodigoProducto = stock.Producto.Codigo,
                NombreProducto = stock.Producto.Nombre,
                IdSucursal = stock.IdSucursal,
                ControlaStock = stock.ControlaStock,
                EnviarAlerta = stock.EnviarAlerta,
                CantidadActual = stock.CantidadActual,
                CantidadMinima = stock.CantidadMinima,
                FechaActualizacion = stock.FechaActualizacion
            };
        }

        private static MovimientoStockDTO MapearMovimiento(MovimientoStock movimiento)
        {
            return new MovimientoStockDTO
            {
                Id = movimiento.Id,
                IdProducto = movimiento.StockProductoSucursal.IdProducto,
                NombreProducto = movimiento.StockProductoSucursal.Producto.Nombre,
                Tipo = movimiento.Tipo,
                Canal = movimiento.Canal.ToString(),
                Cantidad = movimiento.Cantidad,
                StockAnterior = movimiento.StockAnterior,
                StockPosterior = movimiento.StockPosterior,
                Fecha = movimiento.Fecha,
                Motivo = movimiento.Motivo,
                IdVisita = movimiento.IdVisita,
                IdMesa = movimiento.IdMesa,
                NombreMesa = movimiento.NombreMesa,
                NombreMozo = movimiento.NombreMozo
            };
        }
    }
}
