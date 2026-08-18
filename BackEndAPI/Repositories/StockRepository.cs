using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class StockRepository : IStockRepository
    {
        private readonly ICurrentDbContext _currentDbContext;
        private readonly IDatabaseTransactionManager _transactionManager;

        public StockRepository(
            ICurrentDbContext currentDbContext,
            IDatabaseTransactionManager transactionManager)
        {
            _currentDbContext = currentDbContext;
            _transactionManager = transactionManager;
        }

        private Data.AppDbContext Db => _currentDbContext.Db;

        public async Task<IReadOnlyCollection<StockProductoSucursal>> ObtenerStockAsync(Guid idSucursal)
        {
            return await Db.StockProductosSucursales
                .AsNoTracking()
                .Include(x => x.Producto)
                .Where(x => x.IdSucursal == idSucursal)
                .OrderBy(x => x.Producto.Nombre)
                .ToListAsync();
        }

        public async Task<IReadOnlyCollection<MovimientoStock>> ObtenerMovimientosAsync(Guid idProducto, Guid idSucursal)
        {
            return await Db.MovimientosStock
                .AsNoTracking()
                .Include(x => x.StockProductoSucursal)
                .ThenInclude(x => x.Producto)
                .Where(x => x.StockProductoSucursal.IdProducto == idProducto
                    && x.StockProductoSucursal.IdSucursal == idSucursal)
                .OrderByDescending(x => x.Fecha)
                .ToListAsync();
        }

        public async Task<StockProductoSucursal> ConfigurarAsync(
            Guid idProducto,
            Guid idSucursal,
            bool controlaStock,
            int cantidadMinima,
            int? cantidadInicial)
        {
            return await _transactionManager.ExecuteAsync(async () =>
            {
                var stock = await ObtenerConBloqueoAsync(idProducto, idSucursal);
                if (stock == null)
                {
                    var cantidad = cantidadInicial ?? 0;
                    stock = new StockProductoSucursal
                    {
                        IdProducto = idProducto,
                        IdSucursal = idSucursal,
                        ControlaStock = controlaStock,
                        CantidadActual = cantidad,
                        CantidadMinima = cantidadMinima
                    };
                    await Db.StockProductosSucursales.AddAsync(stock);

                    if (cantidad != 0)
                    {
                        await Db.MovimientosStock.AddAsync(CrearMovimiento(
                            stock, cantidad, 0, cantidad, "Inventario inicial", CanalMovimientoStock.Manual, null, "Inventario inicial"));
                    }
                }
                else
                {
                    stock.ControlaStock = controlaStock;
                    stock.CantidadMinima = cantidadMinima;
                }

                stock.FechaActualizacion = DateTime.UtcNow;
                await Db.SaveChangesAsync();
                return stock;
            });
        }

        public async Task<StockProductoSucursal> RegistrarMovimientoAsync(
            Guid idProducto,
            Guid idSucursal,
            int cantidad,
            string? motivo)
        {
            return await _transactionManager.ExecuteAsync(async () =>
            {
                var stock = await ObtenerConBloqueoAsync(idProducto, idSucursal)
                    ?? throw new Exception("El producto no tiene stock configurado");
                if (!stock.ControlaStock) throw new Exception("El control de stock está deshabilitado");

                var cantidadPosterior = CalcularCantidadPosterior(stock, cantidad);
                await Db.MovimientosStock.AddAsync(CrearMovimiento(
                    stock,
                    cantidad,
                    stock.CantidadActual,
                    cantidadPosterior,
                    cantidad > 0 ? "Ingreso" : "Merma",
                    CanalMovimientoStock.Manual,
                    null,
                    motivo));

                stock.CantidadActual = cantidadPosterior;
                stock.FechaActualizacion = DateTime.UtcNow;
                await Db.SaveChangesAsync();
                return stock;
            });
        }

        public async Task AplicarVentaAsync(
            Guid idSucursal,
            IReadOnlyDictionary<Guid, int> productos,
            Guid idVisita,
            bool reponer,
            CanalMovimientoStock canal)
        {
            if (productos.Count == 0) return;

            await _transactionManager.ExecuteAsync(async () =>
            {
                foreach (var producto in productos.OrderBy(x => x.Key))
                {
                    var stock = await ObtenerConBloqueoAsync(producto.Key, idSucursal);
                    if (stock == null || !stock.ControlaStock) continue;

                    var cantidad = reponer ? producto.Value : -producto.Value;
                    var cantidadPosterior = CalcularCantidadPosterior(stock, cantidad);
                    await Db.MovimientosStock.AddAsync(CrearMovimiento(
                        stock,
                        cantidad,
                        stock.CantidadActual,
                        cantidadPosterior,
                        reponer ? "Reposición" : "Venta",
                        canal,
                        idVisita,
                        reponer ? "Producto eliminado de la venta" : "Producto agregado a la venta"));

                    stock.CantidadActual = cantidadPosterior;
                    stock.FechaActualizacion = DateTime.UtcNow;
                }

                await Db.SaveChangesAsync();
            });
        }

        private async Task<StockProductoSucursal?> ObtenerConBloqueoAsync(Guid idProducto, Guid idSucursal)
        {
            var stock = await Db.StockProductosSucursales
                .FromSqlInterpolated($@"
                    SELECT * FROM ""StockProductosSucursales""
                    WHERE ""IdProducto"" = {idProducto} AND ""IdSucursal"" = {idSucursal}
                    FOR UPDATE")
                .SingleOrDefaultAsync();

            if (stock != null)
            {
                await Db.Entry(stock).Reference(x => x.Producto).LoadAsync();
            }

            return stock;
        }

        private static int CalcularCantidadPosterior(StockProductoSucursal stock, int cantidad)
        {
            var cantidadPosterior = checked(stock.CantidadActual + cantidad);
            if (cantidadPosterior < 0)
            {
                throw new Exception($"Stock insuficiente para {stock.Producto.Nombre}");
            }
            return cantidadPosterior;
        }

        private static MovimientoStock CrearMovimiento(
            StockProductoSucursal stock,
            int cantidad,
            int stockAnterior,
            int stockPosterior,
            string tipo,
            CanalMovimientoStock canal,
            Guid? idVisita,
            string? motivo)
        {
            return new MovimientoStock
            {
                StockProductoSucursal = stock,
                Tipo = tipo,
                Canal = canal,
                Cantidad = cantidad,
                StockAnterior = stockAnterior,
                StockPosterior = stockPosterior,
                Motivo = motivo,
                IdVisita = idVisita
            };
        }
    }
}
