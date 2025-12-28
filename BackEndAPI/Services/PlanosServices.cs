using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class PlanosServices : IPlanosServices
    {
        private readonly IPlanosRepository _planosRepository;
        public PlanosServices(IPlanosRepository planosRepository)
        {
            _planosRepository = planosRepository;
        }
        public async Task<Plano> CrearPlano(CrearPlanoDTO request, Guid IdSucursal)
        {
            var planoExistente = await _planosRepository.ObtenerPlanoPorNombreYIdSucursal(request.Nombre, IdSucursal);
            if (planoExistente != null)
            {
                throw new Exception("Plano ya existe");
            }
            Plano nuevoPlano = new Plano
            {
                Id = Guid.NewGuid(),
                Nombre = request.Nombre,
                Detalles = request.Detalles,
                IdSucursal = IdSucursal
            };
            return await _planosRepository.CrearPlano(nuevoPlano);

        }

        public async Task<Plano> ObtenerPlanoPorId(Guid IdPlano)
        {
            var busquedaPlano = await _planosRepository.ObtenerPlanoPorId(IdPlano);
            if (busquedaPlano == null)
            {
                throw new Exception("Plano no encontrado");
            }
            return busquedaPlano;
        }

        public async Task<IEnumerable<Plano>> BuscarListaDePlanos(Guid IdSucursal)
        {
            var busquedaPlanos = await _planosRepository.BuscarListaDePlanos(IdSucursal);
            if (busquedaPlanos == null || !busquedaPlanos.Any())
            {
                throw new Exception("Sucursal no identificada");
            }

            return busquedaPlanos;
        }
        public async Task<Plano> ActualizarPlano(ModificarPlanoDTO request)
        {
            var busquedaPlano = await _planosRepository.ObtenerPlanoPorId(request.IdPlano);

            if (busquedaPlano == null)
            {
                throw new Exception("Plano no encontrado");
            }

            busquedaPlano.Nombre = !string.IsNullOrEmpty(request.Nombre) ? request.Nombre : busquedaPlano.Nombre;
            busquedaPlano.Detalles = !string.IsNullOrEmpty(request.Detalles) ? request.Detalles : busquedaPlano.Detalles;
            busquedaPlano.Mesas = new List<Mesa>(); // Se vacía la lista de mesas para evitar ciclo infinito en la response

            return await _planosRepository.ActualizarPlano(busquedaPlano);
        }
        public async Task<bool> EliminarPlano(Guid IdPlano)
        {

            var planoAEliminar = await _planosRepository.ObtenerPlanoPorId(IdPlano);
            if (planoAEliminar == null)
            {
                throw new Exception("Plano no encontrado");
            }
            var planoEliminado = await _planosRepository.EliminarPlano(planoAEliminar);

            return planoEliminado;
        }
    }
}
