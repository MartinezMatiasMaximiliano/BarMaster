using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class ProductosServices : IProductosServices
    {
        private readonly IProductosRepository _productosRepository;
        private readonly IMenuRepository _menuRepository;
        public ProductosServices(IProductosRepository productosRepository, IMenuRepository menuRepository)
        {
            _productosRepository = productosRepository;
            _menuRepository = menuRepository;
        }

        public async Task<Producto?> CrearProducto(CrearProductoDTO request, string pathImagen)
        {
            var exitente = await _productosRepository.GetProductoPorNombre(request.Nombre);
            if (exitente != null) throw new Exception("El producto ya existe");

            var menu = await _menuRepository.ObtenerMenuPorId(request.IdMenu);
            if (menu == null) throw new Exception("El menú no existe");


            Producto nuevoProducto = new Producto
            {
                IdMenu = request.IdMenu,
                Codigo = request.Codigo,
                Nombre = request.Nombre,
                Descripcion = request.Descripcion,
                Precio = request.Precio,
                CostoProduccion = request.CostoProduccion,
                Activo = request.Activo,
                PathImagen = pathImagen ?? "uploads/ImagenesProductos/Placeholder.jpeg",
                Opciones = request.Opciones?.Select(o => new Opcion
                {
                    Nombre = o.Nombre,
                    PrecioExtra = 0 // Valor por defecto, ya que no viene en el DTO
                }).ToList() ?? new List<Opcion>()
            };
            

            return await _productosRepository.AddProducto(nuevoProducto,menu);
        }

        public async Task<IEnumerable<Producto>> BuscarListaProductos()
        {
            var productos = await _productosRepository.GetAllProductos();

            var listaProductos = productos.Select(producto => new Producto
            {
                Id = producto.Id,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                Activo = producto.Activo,
                PathImagen = producto.PathImagen,
                Categorias = producto.Categorias.ToList()
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
