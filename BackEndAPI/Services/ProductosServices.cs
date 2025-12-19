using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class ProductosServices : IProductosServices
    {
        private readonly IProductosRepository _productosRepository;
        public ProductosServices(IProductosRepository productosRepository)
        {
            _productosRepository = productosRepository;
        }

        public async Task<Producto?> CrearProducto(CrearProductoDTO request)
        {
            var exitente = await _productosRepository.GetProductoPorNombre(request.Nombre);
            if (exitente != null)
            {
                throw new Exception("El producto ya existe");
            }

            Producto nuevoProducto = new Producto
            {
                Codigo = request.Codigo,
                Nombre = request.Nombre,
                Descripcion = request.Descripcion,
                Precio = request.Precio,
                Activo = request.Activo,
                Opciones = request.Opciones.Select(o => new Opcion
                {
                    Nombre = o.Nombre,
                   // PrecioExtra = o.PrecioExtra
                }).ToList()
            };

            //if (request.Imagen == null || request.Imagen.Length == 0)
            //{
            //    nuevoProducto.PathImagen = $"uploads/ImagenesProductos/Placeholder.jpeg";
            //}
            //else
            //{
            //    var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/ImagenesProductos/");
            //    if (!Directory.Exists(folderPath))
            //    {
            //        Directory.CreateDirectory(folderPath);
            //    }

            //    var fileExtension = Path.GetFileName(request.Imagen.FileName).Split('.').Last();
            //    var filePath = Path.Combine(folderPath, $"{request.Nombre.Dehumanize()}.{fileExtension}");

            //    using (var stream = new FileStream(filePath, FileMode.Create))
            //    {
            //        await request.Imagen.CopyToAsync(stream);
            //    }
            //    nuevoProducto.PathImagen = $"uploads/ImagenesProductos/{request.Nombre.Dehumanize()}.{fileExtension}";
            //}
            return await _productosRepository.AddProducto(nuevoProducto);
        }

        public async Task<IEnumerable<Producto>> BuscarListaProductos()
        {
            var productos = await _productosRepository.GetAllProductosAsync();

            var listaProductos = productos.Select(producto => new Producto
            {
                Id = producto.Id,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                Activo = producto.Activo,
                PathImagen = producto.PathImagen,

            }).ToList();

            return listaProductos;
        }

        public Task EliminarProducto(int id)
        {
            throw new NotImplementedException();
        }

        public Task<Producto> BuscarProductoPorId(int id)
        {
            throw new NotImplementedException();
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
    }
}
