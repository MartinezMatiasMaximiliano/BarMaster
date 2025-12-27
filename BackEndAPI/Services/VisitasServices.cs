using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class VisitasServices : IVisitasServices
    {
        private readonly IVisitasRepository _VisitasRepository;
        public VisitasServices(IVisitasRepository repository)
        {
            _VisitasRepository = repository;
        }

        public async Task<Visita> AgregarProductos(ICollection<Producto> productos, Guid IdVisita)
        {
            {
                if (productos == null)
                {
                    throw new Exception("Lista de productos vacia");
                }
                if (IdVisita == Guid.Empty)
                {
                    throw new Exception("IdVisita vacio");
                }

                var visita = await _VisitasRepository.BuscarVisitaPorId(IdVisita);
                if (visita == null)
                {
                    throw new Exception("Visita no encontrada");
                }

                foreach (var item in productos)
                {
                    visita.Productos.Add(null);
                }

                return visita;


            }
        }
    }
}


