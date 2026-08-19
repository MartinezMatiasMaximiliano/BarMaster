using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Tenancy.Services;

namespace BackEndAPI.Services
{
    public class ProductosServices : IProductosServices
    {
        private readonly IProductosRepository _productosRepository;
        private readonly ICategoriasRepository _categoriasRepository;
        private readonly IMenuRepository _menuRepository;
        private readonly IStockServices _stockServices;
        private readonly IDatabaseTransactionManager _transactionManager;

        public ProductosServices(
            IProductosRepository productosRepository,
            ICategoriasRepository categoriasRepository,
            IMenuRepository menuRepository,
            IStockServices stockServices,
            IDatabaseTransactionManager transactionManager)
        {
            _productosRepository = productosRepository;
            _categoriasRepository = categoriasRepository;
            _menuRepository = menuRepository;
            _stockServices = stockServices;
            _transactionManager = transactionManager;
        }

        public async Task<Producto?> CrearProducto(CrearProductoDTO request, Guid idSucursal)
        {
            var existente = await _productosRepository.GetProductoPorNombre(request.Nombre);
            if (existente != null) throw new Exception("El producto ya existe");
            if (request.ControlaStock && !request.CantidadMinima.HasValue)
                throw new Exception("La cantidad mínima es obligatoria");
            if (request.ControlaStock && !request.CantidadInicial.HasValue)
                throw new Exception("La cantidad inicial es obligatoria");
            if (request.ControlaStock && request.CantidadMinima!.Value < 0)
                throw new Exception("La cantidad mínima no puede ser negativa");
            if (request.ControlaStock && request.CantidadInicial!.Value < 0)
                throw new Exception("La cantidad inicial no puede ser negativa");

            // Procesar imagen y generar path
            var pathImagen = await FileHelper.GuardarImagenProducto(request.Imagen, request.Nombre);

            return await _transactionManager.ExecuteAsync(async () =>
            {
                Producto nuevoProducto = new Producto
                {
                    Codigo = request.Codigo,
                    Nombre = request.Nombre,
                    Descripcion = request.Descripcion,
                    PrecioNeto = request.PrecioNeto,
                    PorcentajeIVA = request.PorcentajeIVA,
                    CostoProduccion = request.CostoProduccion,
                    Activo = request.Activo,
                    PathImagen = pathImagen ?? "uploads/ImagenesProductos/Placeholder.jpeg",
                };
                var categorias = await _categoriasRepository.GetListaCategorias(request.ListaIdCategorias);
                nuevoProducto.Categorias = categorias.ToList();

                var productoCreado = await _productosRepository.AddProducto(nuevoProducto);

                if (request.ControlaStock)
                {
                    await _stockServices.ConfigurarAsync(
                        nuevoProducto.Id,
                        idSucursal,
                        new ConfigurarStockDTO
                        {
                            ControlaStock = true,
                            EnviarAlerta = request.EnviarAlerta,
                            CantidadMinima = request.CantidadMinima!.Value,
                            CantidadInicial = request.CantidadInicial
                        });
                }

                return productoCreado;
            });
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
                PrecioNeto = producto.PrecioNeto,
                PorcentajeIVA = producto.PorcentajeIVA,
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
            if (request.PrecioNeto.HasValue) busqueda.PrecioNeto = (decimal)request.PrecioNeto;
            if (request.PorcentajeIVA.HasValue) busqueda.PorcentajeIVA = (decimal)request.PorcentajeIVA;
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
