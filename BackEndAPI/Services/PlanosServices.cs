using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Exceptions;
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
            if (string.IsNullOrWhiteSpace(request.Nombre))
            {
                throw new BusinessRuleException("El nombre del plano es obligatorio");
            }

            var planoExistente = await _planosRepository.ObtenerPlanoPorNombreYIdSucursal(request.Nombre, IdSucursal);
            if (planoExistente != null)
            {
                throw new ConflictException("Plano ya existe");
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
            if (IdPlano == Guid.Empty)
            {
                throw new BusinessRuleException("IdPlano no puede estar vacío");
            }

            var busquedaPlano = await _planosRepository.ObtenerPlanoPorId(IdPlano);
            if (busquedaPlano == null)
            {
                throw new NotFoundException("Plano no encontrado");
            }
            return busquedaPlano;
        }

        public async Task<IEnumerable<Plano>> BuscarListaDePlanos(Guid IdSucursal)
        {
            var busquedaPlanos = await _planosRepository.BuscarListaDePlanos(IdSucursal);
            if (busquedaPlanos == null || !busquedaPlanos.Any())
            {
                throw new NotFoundException("No se encontraron planos para la sucursal indicada");
            }

            return busquedaPlanos;
        }
        public async Task<Plano> ActualizarPlano(ModificarPlanoDTO request)
        {
            var busquedaPlano = await _planosRepository.ObtenerPlanoPorId(request.IdPlano);

            if (busquedaPlano == null)
            {
                throw new NotFoundException("Plano no encontrado");
            }

            if (!string.IsNullOrEmpty(request.Nombre) && request.Nombre != busquedaPlano.Nombre)
            {
                var otroConMismoNombre = await _planosRepository.ObtenerPlanoPorNombreYIdSucursal(request.Nombre, busquedaPlano.IdSucursal);
                if (otroConMismoNombre != null && otroConMismoNombre.Id != busquedaPlano.Id)
                {
                    throw new ConflictException("Plano ya existe");
                }
            }

            busquedaPlano.Nombre = !string.IsNullOrEmpty(request.Nombre) ? request.Nombre : busquedaPlano.Nombre;
            busquedaPlano.Detalles = !string.IsNullOrEmpty(request.Detalles) ? request.Detalles : busquedaPlano.Detalles;

            return await _planosRepository.ActualizarPlano(busquedaPlano);
        }
        public async Task<bool> EliminarPlano(Guid IdPlano)
        {

            var planoAEliminar = await _planosRepository.ObtenerPlanoPorId(IdPlano);
            if (planoAEliminar == null)
            {
                throw new NotFoundException("Plano no encontrado");
            }
            var planoEliminado = await _planosRepository.EliminarPlano(planoAEliminar);

            return planoEliminado;
        }
    }
}
