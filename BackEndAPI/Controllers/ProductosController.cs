using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Services.Global;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

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

        [HttpGet]
        public async Task<ActionResult<List<ProductoDTO>>> Get()
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
                        .ToArray() ?? Array.Empty<string>()
                }).ToList();

                return Ok(listaProductos);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { message = "Internal server error catch: Get Productos - " + e.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromForm]CrearProductoDTO request)
        {
            try
            {
                // Procesar opciones desde el form data (necesario cuando hay archivo)
                if (request.Opciones == null || request.Opciones.Count == 0)
                {
                    request.Opciones = FormDataHelper.ProcesarOpcionesDesdeForm(Request.Form, request.Nombre);
                }

                // Validar que el producto no exista
                if (await _productosServices.ProductoExiste(request.Nombre))
                {
                    return Conflict("El producto ya existe");
                }

                // Procesar imagen y generar path
                var pathImagen = await FileHelper.GuardarImagenProducto(request.Imagen, request.Nombre);

                // Crear producto
                var producto = await _productosServices.CrearProducto(request, pathImagen);
                return Ok(producto);
            }
            catch (Exception ex)
            {
                return ex.Message switch
                {
                    "El producto ya existe" => Conflict("El producto ya existe"),
                    "Request nulo" => BadRequest("Request nulo"),
                    _ => StatusCode(500, "Error interno del servidor")
                };
            }
        }
        //{
        //    try
        //    {
        //        var BuscarProducto = await _context.Productos.Where(producto => producto.Nombre == request.Nombre).FirstOrDefaultAsync();

        //        if (BuscarProducto != null)
        //        {
        //            return Conflict(new ErrorDTO(409, "CONFLICT", $"La categoria {BuscarProducto.Nombre} ya existe"));
        //        };

        //        if (request.Categorias.Length == 0)
        //        {
        //            return BadRequest(new ErrorDTO(400, "BAD REQUEST", "Se necesita al menos una categoria existente!"));
        //        }

        //        var ListaCategorias = await _context.Categorias
        //            .Where(categoria => request.Categorias.Contains(categoria.Nombre)).ToListAsync();

        //        if (ListaCategorias.Count != request.Categorias.Length)
        //        {
        //            return BadRequest(new ErrorDTO(400, "BAD REQUEST", "Una o más categorias no existen"));
        //        }

        //        var producto = new Producto
        //        {
        //            Nombre = request.Nombre,
        //            Descripcion = request.Descripcion,
        //            Precio = request.Precio,
        //            Activo = request.Activo,
        //            Categorias = ListaCategorias,
        //        };

        //        if (request.Imagen == null || request.Imagen.Length == 0)
        //        {
        //            producto.PathImagen = $"uploads/ImagenesProductos/Placeholder.jpeg";
        //        }
        //        else
        //        {
        //            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/ImagenesProductos/");
        //            if (!Directory.Exists(folderPath))
        //            {
        //                Directory.CreateDirectory(folderPath);
        //            }

        //            var fileExtension = Path.GetFileName(request.Imagen.FileName).Split('.').Last();
        //            var filePath = Path.Combine(folderPath, $"{request.Nombre.Dehumanize()}.{fileExtension}");

        //            using (var stream = new FileStream(filePath, FileMode.Create))
        //            {
        //                await request.Imagen.CopyToAsync(stream);
        //            }
        //            producto.PathImagen = $"uploads/ImagenesProductos/{request.Nombre.Dehumanize()}.{fileExtension}";


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

