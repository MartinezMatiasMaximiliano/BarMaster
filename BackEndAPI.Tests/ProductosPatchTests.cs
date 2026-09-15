using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services;

namespace BackEndAPI.Tests.Contratos;

public class ProductosPatchTests
{
    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    [InlineData(null)]
    public async Task CamposOmitidosConservanValores(bool? activo)
    {
        var repo = new Repositorio();
        var servicio = new ProductosServices(repo, null!, null!, null!, null!);
        var dto = new ModificarProductoDTO { IdProducto = repo.Producto.Id, Nombre = "Editado" };
        if (activo.HasValue) dto.Activo = activo;
        await servicio.ActualizarProducto(dto);
        Assert.Equal(120m, repo.Producto.PrecioNeto);
        Assert.Equal(21m, repo.Producto.PorcentajeIVA);
        Assert.Equal(activo ?? false, repo.Producto.Activo);
        Assert.Equal("Editado", repo.Producto.Nombre);
    }

    [Fact]
    public async Task CeroExplicitoSeGuarda()
    {
        var repo = new Repositorio();
        await new ProductosServices(repo, null!, null!, null!, null!).ActualizarProducto(
            new ModificarProductoDTO { IdProducto = repo.Producto.Id, PrecioNeto = 0, PorcentajeIVA = 0, CostoProduccion = 0 });
        Assert.Equal(0m, repo.Producto.PrecioNeto);
        Assert.Equal(0m, repo.Producto.PorcentajeIVA);
        Assert.Equal(0m, repo.Producto.CostoProduccion);
        Assert.False(repo.Producto.Activo);
    }

    private class Repositorio : IProductosRepository
    {
        public Producto Producto = new() { Id = Guid.NewGuid(), Nombre = "Original", PrecioNeto = 120, PorcentajeIVA = 21, Activo = false };
        public Task<Producto?> GetProductoPorId(Guid id) => Task.FromResult<Producto?>(Producto);
        public Task<Producto?> UpdateProducto(Producto producto) => Task.FromResult<Producto?>(producto);
        public Task<IEnumerable<Producto>> GetAllProductos() => throw new NotImplementedException();
        public Task<Producto?> GetProductoPorNombre(string nombre) => throw new NotImplementedException();
        public Task<Producto?> AddProducto(Producto producto) => throw new NotImplementedException();
        public Task<Producto?> DeleteProducto(Producto producto) => throw new NotImplementedException();
        public Task<bool> ProductoExiste(string nombre) => throw new NotImplementedException();
    }
}
