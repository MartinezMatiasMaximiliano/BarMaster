using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class ProductosServices : IProductosServices
    {
        private readonly IProductosRepository _productosRepository;
        private readonly ICategoriasRepository _categoriasRepository;
        private readonly IMenuRepository _menuRepository;
        public ProductosServices(IProductosRepository productosRepository, ICategoriasRepository categoriasRepository, IMenuRepository menuRepository)
        {
            _productosRepository = productosRepository;
            _categoriasRepository = categoriasRepository;
            _menuRepository = menuRepository;
        }

        public async Task<Producto?> CrearProducto(CrearProductoDTO request)
        {
            var existente = await _productosRepository.GetProductoPorNombre(request.Nombre);
            if (existente != null) throw new Exception("El producto ya existe");

            // Procesar imagen y generar path
            var pathImagen = await FileHelper.GuardarImagenProducto(request.Imagen, request.Nombre);

            Producto nuevoProducto = new Producto
            {
                Codigo = request.Codigo,
                Nombre = request.Nombre,
                Descripcion = request.Descripcion,
                Precio = request.Precio,
                CostoProduccion = request.CostoProduccion,
                Activo = request.Activo,
                PathImagen = pathImagen ?? "uploads/ImagenesProductos/Placeholder.jpeg",
            };
            var categorias = _categoriasRepository.GetListaCategorias(request.ListaIdCategorias).Result;
            nuevoProducto.Categorias = categorias.ToList();

            return await _productosRepository.AddProducto(nuevoProducto);
        }

        public async Task<IEnumerable<Producto>> BuscarListaProductos()
        {
            var productos = await _productosRepository.GetAllProductos();

            var listaProductos = productos.Select(producto => new Producto
            {
                Id = producto.Id,
                Codigo = producto.Codigo,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                CostoProduccion = producto.CostoProduccion,
                Activo = producto.Activo,
                PathImagen = producto.PathImagen,
                Categorias = producto.Categorias.ToList()
            }).ToList();

            return listaProductos;
        }

        public async Task<Producto?> EliminarProducto(Guid id)
        {
            var busqueda = await _productosRepository.GetProductoPorId(id);
            if (busqueda == null) throw new Exception("El producto no fue encontrado");
            return await _productosRepository.DeleteProducto(busqueda);
        }

        public async Task<Producto> BuscarProductoPorId(Guid id)
        {
            var busqueda = await _productosRepository.GetProductoPorId(id);
            if (busqueda == null) throw new Exception("El producto no fue encontrado");
            return busqueda;

        }

        public async Task<Producto?> BuscarProductoPorNombre(string nombre)
        {
            var busqueda = await _productosRepository.GetProductoPorNombre(nombre);
            if (busqueda == null)
            {
                throw new Exception("El producto no existe");
            }
            return busqueda;
        }

        public Task<bool> ProductoExiste(string nombre)
        {
            var busqueda = _productosRepository.ProductoExiste(nombre);
            return busqueda;
        }

        public Task ActualizarProducto(Producto producto)
        {
            throw new NotImplementedException();
        }

        public async Task<Producto?> ActualizarProducto(ModificarProductoDTO request)
        {
            var busqueda = await _productosRepository.GetProductoPorId(request.IdProducto);
            if (busqueda == null) throw new Exception("El producto no fue encontrado");

            if (request.Codigo != null) busqueda.Codigo = request.Codigo;
            if (!string.IsNullOrEmpty(request.Nombre)) busqueda.Nombre = request.Nombre;
            if (!string.IsNullOrEmpty(request.Descripcion)) busqueda.Descripcion = request.Descripcion;
            if (request.Precio.HasValue) busqueda.Precio = (decimal)request.Precio;
            if (request.CostoProduccion.HasValue) busqueda.CostoProduccion = request.CostoProduccion;
            busqueda.Activo = request.Activo ?? busqueda.Activo;

            if (request.categorias != null && request.categorias.Count() > 0)
            {
                var categorias = await _categoriasRepository.GetListaCategorias(request.categorias);
                busqueda.Categorias = categorias.ToList();
            }

            if (request.Imagen != null)
            {
                var pathImagen = await FileHelper.GuardarImagenProducto(request.Imagen, busqueda.Nombre);
                busqueda.PathImagen = pathImagen ?? busqueda.PathImagen;
            }

            return await _productosRepository.UpdateProducto(busqueda);
        }
    }
}
