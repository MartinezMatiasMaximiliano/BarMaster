using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using System.Collections.Immutable;
using System.Linq;

namespace BackEndAPI.Services
{
    public class ProductosServices : IProductosServices
    {
        private readonly IProductosRepository _productosRepository; 

        public ProductosServices(IProductosRepository productosRepository)
        {
            _productosRepository = productosRepository;
        }
        public async Task<IEnumerable<ProductoDTO>> GetAllProductosAsync()
        {
            var productos = await _productosRepository.GetAllProductosAsync();

            var listaProductos = productos.Select(producto => new ProductoDTO
            {
                Id = producto.Id,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                Activo = producto.Activo,
                ImagenUrl = producto.PathImagen,
                Categorias = producto.CategoriaProductos.Where(categoria => categoria.Categoria.Activo != false).Select(categoria => categoria.Categoria.Nombre).ToArray()
            }).ToList();

            return listaProductos;
        }

        public Task AddProductoAsync(ProductoDTO producto)
        {
            throw new NotImplementedException();
        }

        public Task DeleteProductoAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<ProductoDTO> GetProductoByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> ProductoExistsAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task UpdateProductoAsync(ProductoDTO producto)
        {
            throw new NotImplementedException();
        }
    }
}
