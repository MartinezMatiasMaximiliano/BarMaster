using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using System.Runtime.CompilerServices;

namespace BackEndAPI.Services
{
    public class VisitasServices : IVisitasServices
    {
        private readonly IVisitasRepository _visitasRepository;
        private readonly IProductosRepository _productosRepository;
        public VisitasServices(IVisitasRepository repository, IProductosRepository productosRepository)
        {
            _visitasRepository = repository;
            _productosRepository = productosRepository;
        }

        public async Task<Visita> BuscarVisitaPorId(Guid IdVisita)
        {
            var visita = await _visitasRepository.BuscarVisitaPorId(IdVisita);
            if (visita == null)
            {
                throw new Exception("Visita no encontrada");
            }
            return visita;
        }
        public async Task<Visita> AgregarProductos(ICollection<AgregarProductoAVisita> productos, Guid IdVisita)
        {
            decimal Total = 0;
            if (productos == null || productos.Count <= 0) throw new Exception("Lista de productos vacia");
            if (IdVisita == Guid.Empty) throw new Exception("IdVisita vacio");

            var visita = await _visitasRepository.BuscarVisitaPorId(IdVisita);

            if (visita == null)throw new Exception("Visita no encontrada");
            

            foreach (var item in productos)
            {
                //TODO: Mejorar esto, buscar una manera de 
                //agregar los productos que si se encuentran y notificar los que no se encuentran... (no no agregar ninguno si algo falla?)
                var producto = await _productosRepository.GetProductoPorId(item.IdProducto);
                if (producto == null)
                {
                    continue;
                }

                for (int i = 1; i <= item.Cantidad; i++)
                {
                    var productoPorVisita = new ProductosPorVisita
                    {

                        IdVisita = IdVisita,
                        IdProducto = item.IdProducto,
                        NombreProducto = producto.Nombre,
                        Detalles = item.Detalles,
                        PrecioDelMomento = producto.Precio,
                        EstadoPagado = false,
                        EstadoPedido = "Pendiente",
                    };
                    Total += producto.Precio;
                    visita.Productos.Add(productoPorVisita);
                }
            }

            return await _visitasRepository.ModificarVisita(visita);
        }
        
        public async Task<IEnumerable<Visita>> ObtenerVisitasActivas()
        {
            return await _visitasRepository.ObtenerVisitasActivas();
        }

        public async Task<IEnumerable<Visita>> ObtenerTodasLasVisitas()
        {
            return await _visitasRepository.ObtenerTodasLasVisitas();
        }

        public async Task<decimal> CalcularTotal(Guid IdVisita)
        {
            var visita = await _visitasRepository.BuscarVisitaPorId(IdVisita);
            if (visita == null)
            {
                throw new Exception("Visita no encontrada");
            }
            return visita.Productos?.Sum(p => p.PrecioDelMomento) ?? 0;
        }

        public async Task<bool> EliminarProductos(Guid IdVisita, ICollection<int> IdsProductos)
        {
            // Validaciones de negocio
            if (IdVisita == Guid.Empty)
            {
                throw new Exception("El IdVisita no puede estar vacío");
            }

            if (IdsProductos == null || IdsProductos.Count == 0)
            {
                throw new Exception("Lista de IDs de productos vacía");
            }

            // Verificar que la visita existe y cargarla con sus productos
            var visita = await _visitasRepository.BuscarVisitaPorId(IdVisita);
            if (visita == null)
            {
                throw new Exception("Visita no encontrada");
            }

            // Verificar que los productos existen en la visita
            var productosEnVisita = visita.Productos?.Select(p => p.Id).ToList() ?? new List<int>();
            var productosNoEncontrados = IdsProductos.Where(id => !productosEnVisita.Contains(id)).ToList();

            if (productosNoEncontrados.Any())
            {
                throw new Exception($"Los siguientes IDs de productos no pertenecen a esta visita: {string.Join(", ", productosNoEncontrados)}");
            }

            // Si todas las validaciones pasan, proceder con la eliminación en la DB
            // Pasamos la visita ya cargada para evitar una segunda consulta
            return await _visitasRepository.EliminarProductos(visita, IdsProductos);
        }

        public async Task<bool> CambiarEstadoProducto(int idProducto, string estado)
        {
            // Validaciones de negocio
            if (idProducto <= 0)
            {
                throw new Exception("El IdProducto debe ser mayor a cero");
            }

            if (string.IsNullOrWhiteSpace(estado))
            {
                throw new Exception("El estado no puede estar vacío");
            }

            // Validar que el estado sea uno de los permitidos
            var estadosPermitidos = new[] { "Pendiente", "En Preparación", "Listo" };
            if (!estadosPermitidos.Contains(estado))
            {
                throw new Exception($"El estado '{estado}' no es válido. Los estados permitidos son: {string.Join(", ", estadosPermitidos)}");
            }

            // Cambiar el estado en la DB
            var resultado = await _visitasRepository.CambiarEstadoProducto(idProducto, estado);
            
            if (!resultado)
            {
                throw new Exception("Producto no encontrado");
            }

            return true;
        }
    }
}


