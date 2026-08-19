using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Response;
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

        [HttpGet("")]
        public async Task<ActionResult<List<ProductoDTO>>> GetTodosLosProductos()
        {
            try
            {
                var busqueda = await _productosServices.BuscarListaProductos();
                var listaProductos = busqueda.Select(producto => new ProductoDTO
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
                }).ToList();

                return Ok(listaProductos);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "No se encontraron productos":
                        return NotFound(new { message = "No se encontraron productos" });
                    default:
                        return StatusCode(500, new { message = "Error interno del servidor" });
                }
            }
        }

        [HttpGet("{ProductoId}")]
        public async Task<ActionResult<ProductoDTO>> GetProductoPorId(Guid ProductoId)
        {
            try
            {
                var producto = await _productosServices.BuscarProductoPorId(ProductoId);
                var productoDTO = new ProductoDTO
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
                return Ok(productoDTO);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El producto no fue encontrado":
                        return NotFound(new ErrorDTO(404,"NOT FOUND",ex.Message));
                    default:
                        return StatusCode(500, new { message = "Error interno del servidor" });
                }
            }
        }

        [HttpPost()]
        public async Task<ActionResult> CrearProducto([FromForm] CrearProductoDTO request)
        {
            try
            {
                if (request.Nombre == null) throw new Exception("Nombre nulo");
                if (request.PrecioNeto <= 0) throw new Exception("Precio invalido");

                var idSucursal = request.ControlaStock ? ObtenerIdSucursal() : Guid.Empty;
                var producto = await _productosServices.CrearProducto(request, idSucursal);

                return Ok();
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Precio invalido":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "El producto ya existe":
                        return Conflict(new ErrorDTO(409, "CONFLICT", ex.Message));
                    case "Nombre nulo":
                    case "La cantidad mínima es obligatoria":
                    case "La cantidad inicial es obligatoria":
                    case "La cantidad mínima no puede ser negativa":
                    case "La cantidad inicial no puede ser negativa":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }

        private Guid ObtenerIdSucursal()
        {
            var claim = User.Claims.FirstOrDefault(x => x.Type == "IdSucursal")?.Value;
            if (!Guid.TryParse(claim, out var idSucursal)) throw new Exception("Sucursal no identificada");
            return idSucursal;
        }

        [HttpPatch()]
        public async Task<ActionResult> ModificarProducto([FromForm] ModificarProductoDTO request)
        {
            try
            {
                if (request.IdProducto == Guid.Empty) throw new Exception("IdProducto es requerido");

                var producto = await _productosServices.ActualizarProducto(request);

                return Ok();
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El producto no fue encontrado":
                        return NotFound(new ErrorDTO(404,"NOT FOUND",ex.Message));
                    case "IdProducto es requerido":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }

        [HttpDelete()]
        public async Task<ActionResult> EliminarProducto([FromQuery]Guid IdProducto)
        {
            try
            {
                if (IdProducto == Guid.Empty) throw new Exception("IdProducto es requerido");
                var producto = await _productosServices.EliminarProducto(IdProducto);
                return Ok();
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "IdProducto es requerido":
                        return BadRequest(new ErrorDTO(400,"BAD REQUEST",ex.Message));
                    case "El producto no fue encontrado":
                        return NotFound(new ErrorDTO(404,"NOT FOUND",ex.Message));
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }
    }
}
