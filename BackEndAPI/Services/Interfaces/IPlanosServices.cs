using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IPlanosServices
    {
        public Task<Plano> CrearPlano(CrearPlanoDTO request, Guid IdSucursal);
        public Task<Plano> ObtenerPlanoPorId(Guid IdPlano);
        public Task<IEnumerable<Plano>> BuscarListaDePlanos(Guid IdSucursal);
        public Task<Plano?> ActualizarPlano(ModificarPlanoDTO request);
        public Task<bool> EliminarPlano(Guid IdPlano);

    }
}
