using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Exceptions;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEndAPI.DTOs.Request.Modificar;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class ProductosController : ControllerBase
    {
        private readonly IProductosServices _productosServices;

        public ProductosController(IProductosServices productosServices)
        {
            _productosServices = productosServices;
        }

        // Ya no hay try/catch acá: si algo falla, la excepción (tipada o no) burbujea hasta
        // ExceptionHandlingMiddleware, que decide el status code y loguea con el contexto completo.

        [HttpGet("")]
        public async Task<ActionResult<List<ProductoDTO>>> GetTodosLosProductos()
        {
            var busqueda = await _productosServices.BuscarListaProductos();
            return Ok(busqueda.Select(MapearProducto).ToList());
        }

        [HttpGet("{ProductoId}")]
        public async Task<ActionResult<ProductoDTO>> GetProductoPorId(Guid ProductoId)
        {
            var producto = await _productosServices.BuscarProductoPorId(ProductoId);
            return Ok(MapearProducto(producto));
        }

        [HttpPost()]
        public async Task<ActionResult> CrearProducto([FromForm] CrearProductoDTO request)
        {
            if (request.Nombre == null) throw new BusinessRuleException("Nombre nulo");
            if (request.PrecioNeto <= 0) throw new BusinessRuleException("Precio invalido");

            var idSucursal = request.ControlaStock ? ObtenerIdSucursal() : Guid.Empty;
            await _productosServices.CrearProducto(request, idSucursal);

            return Ok();
        }

        [HttpPatch()]
        public async Task<ActionResult> ModificarProducto([FromForm] ModificarProductoDTO request)
        {
            if (request.IdProducto == Guid.Empty) throw new BusinessRuleException("IdProducto es requerido");

            await _productosServices.ActualizarProducto(request);

            return Ok();
        }

        [HttpDelete()]
        public async Task<ActionResult> EliminarProducto([FromQuery] Guid IdProducto)
        {
            if (IdProducto == Guid.Empty) throw new BusinessRuleException("IdProducto es requerido");
            await _productosServices.EliminarProducto(IdProducto);
            return Ok();
        }

        private Guid ObtenerIdSucursal()
        {
            var claim = User.Claims.FirstOrDefault(x => x.Type == "IdSucursal")?.Value;
            if (!Guid.TryParse(claim, out var idSucursal) || idSucursal == Guid.Empty)
                throw new BusinessRuleException("Sucursal no identificada");
            return idSucursal;
        }

        private static ProductoDTO MapearProducto(Producto producto) => new ProductoDTO
        {
            Id = producto.Id,
            Codigo = producto.Codigo,
            Nombre = producto.Nombre,
            Descripcion = producto.Descripcion ?? string.Empty,
            PrecioNeto = producto.PrecioNeto,
            PorcentajeIVA = producto.PorcentajeIVA,
            CostoProduccion = producto.CostoProduccion,
            Activo = producto.Activo,
            ImagenUrl = producto.PathImagen ?? string.Empty,
            Categorias = producto.Categorias?
                .Where(categoria => categoria != null && categoria.Activo)
                .Select(categoria => categoria.Nombre)
                .ToArray() ?? Array.Empty<string>(),
        };
    }
}
