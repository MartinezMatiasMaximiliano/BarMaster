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
            {
                if (productos == null || productos.Count <= 0)
                {
                    throw new Exception("Lista de productos vacia");
                }

                if (IdVisita == Guid.Empty)
                {
                    throw new Exception("IdVisita vacio");
                }

                var visita = await _visitasRepository.BuscarVisitaPorId(IdVisita);

                if (visita == null)
                {
                    throw new Exception("Visita no encontrada");
                }

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

                        };
                        visita.Productos.Add(productoPorVisita);
                    }
                }

                return await _visitasRepository.ModificarVisita(visita);
            }
        }

        public async Task<IEnumerable<Visita>> ObtenerVisitasActivasAsync()
        {
            return await _visitasRepository.ObtenerVisitasActivasAsync();
        }
    }
}


