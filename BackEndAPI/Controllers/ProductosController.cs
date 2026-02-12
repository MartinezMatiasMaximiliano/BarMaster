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
                    Nombre = producto.Nombre,
                    Descripcion = producto.Descripcion ?? string.Empty,
                    Precio = producto.Precio,
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
                    Nombre = producto.Nombre,
                    Descripcion = producto.Descripcion ?? string.Empty,
                    Precio = producto.Precio,
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
                    case "Producto no encontrado":
                        return NotFound(new { message = "Producto no encontrado" });
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

                var producto = await _productosServices.CrearProducto(request);

                return Ok();
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El producto ya existe":
                        return Conflict("El producto ya existe");
                    case "Nombre nulo":
                        return BadRequest("Nombre nulo");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }

        [HttpPatch("")]
        public async Task<ActionResult> ModificarProducto([FromForm] ModificarProductoDTO request)
        {
            try
            {
                if (request.IdProducto == Guid.Empty) throw new Exception("Id nulo");
                var producto = await _productosServices.ActualizarProducto(request);
                return Ok();
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Producto no encontrado":
                        return NotFound("Producto no encontrado");
                    case "Id nulo":
                        return BadRequest("Id nulo");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }

        [HttpDelete("")]
        public async Task<ActionResult> EliminarProducto([FromQuery]Guid IdProducto)
        {
            try
            {
                if (IdProducto == Guid.Empty) throw new Exception("Id nulo");
                var producto = await _productosServices.EliminarProducto(IdProducto);
                return Ok();
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Producto no encontrado":
                        return NotFound("Producto no encontrado");
                    case "Id nulo":
                        return BadRequest("Id nulo");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }


    }
}

#region CODIGO ANTIGUO




//[HttpGet("{Id}")]
//public async Task<ActionResult<ProductoDTO>> Get(int Id)
//{
//    try
//    {
//        var busqueda = await _context.Productos.Include(producto => producto.Categorias).FirstAsync(producto => producto.Id == Id);

//        if (busqueda == null)
//        {
//            return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se encontró un producto con Id: {Id}"));
//        }

//        var producto = new ProductoDTO
//        {
//            Id = busqueda.Id,
//            Nombre = busqueda.Nombre,
//            Descripcion = busqueda.Descripcion,
//            Precio = busqueda.Precio,
//            Activo = busqueda.Activo,
//            ImagenUrl = busqueda.PathImagen,
//            Categorias = busqueda.Categorias.Select(categoria => categoria.Nombre).ToArray()
//        };

//        return Ok(producto);
//    }
//    catch (Exception e)
//    {
//        return StatusCode(500, "Internal server error catch: Get Productos Id - " + e.Message);
//    }

//}



//[HttpPut("{Id}")]
//public async Task<ActionResult> Put(int Id, ModificarProductoDTO request)
//{
//    try
//    {
//        var busqueda = await _context.Productos.Include(producto => producto.Categorias).FirstAsync(producto => producto.Id == Id);

//        if (busqueda == null)
//        {
//            return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se pudo encontrar un producto con Id:{Id}"));
//        }
//        var nuevasCategorias = await _context.Categorias.Where(categoria => request.categorias.Contains(categoria.Nombre)).ToListAsync();

//        busqueda.Nombre = !string.IsNullOrEmpty(request.Nombre) ? request.Nombre : busqueda.Nombre;
//        busqueda.Descripcion = !string.IsNullOrEmpty(request.Descripcion) ? request.Descripcion : busqueda.Descripcion;
//        busqueda.Precio = request.Precio != -1 ? request.Precio : busqueda.Precio;
//        busqueda.Categorias = nuevasCategorias.Any() ? nuevasCategorias : busqueda.Categorias;
//        busqueda.Activo = busqueda.Activo != request.Activo ? request.Activo : busqueda.Activo;

//        //cambiar la foto
//        if (request.Imagen != null)
//        { //actua solo si se envio una foto nueva

//            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/ImagenesProductos/");

//            if (!Directory.Exists(folderPath))
//            {
//                Directory.CreateDirectory(folderPath);
//            }

//            var fileExtension = Path.GetFileName(request.Imagen.FileName).Split('.').Last();
//            var filePath = Path.Combine(folderPath, $"{busqueda.Nombre.Dehumanize()}.{fileExtension}");

//            FileInfo imagenVieja = new FileInfo(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/" + busqueda.PathImagen));
//            if (!imagenVieja.Name.Contains("Placeholder"))
//            {
//                imagenVieja.Delete();
//            }

//            using (var stream = new FileStream(filePath, FileMode.Create))
//            {
//                await request.Imagen.CopyToAsync(stream);
//            }

//            busqueda.PathImagen = $"uploads/ImagenesProductos/{busqueda.Nombre.Dehumanize()}.{fileExtension}";
//        }

//        _context.Entry(busqueda).State = EntityState.Modified;
//        await _context.SaveChangesAsync();
//        return Ok(new EntregaDTO(200, "OK", $"Modificado exitosamente, Id:{Id}"));
//    }
//    catch (Exception e)
//    {
//        return StatusCode(500, "Internal server error catch: Put Productos - " + e.Message);
//    }
//}

//[HttpDelete("{Id}")]
//[Authorize]
//public async Task<ActionResult> Delete(int Id)
//{
//    try
//    {
//    var busqueda = await _context.Productos.FindAsync(Id);

//    if (busqueda == null)
//    {
//        return NotFound(new ErrorDTO(404, "NOT FOUND", $"No existe un producto con el Id: {busqueda.Id}"));
//    }

//    _context.Productos.Remove(busqueda);
//    await _context.SaveChangesAsync();
//    return Ok(new EntregaDTO(200, "OK", $"Eliminado exitosamente, Id:{Id}"));
//    }
//    catch (Exception e)
//    {
//        return StatusCode(500, "Internal server error catch: Delete Productos - " + e.Message);
//    }
//}

#endregion

