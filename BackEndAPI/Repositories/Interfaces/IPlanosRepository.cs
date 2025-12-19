using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IPlanosRepository
    {
        public Task<Plano> CrearPlano(Plano nuevoPlano);
        public Task<Plano?> ObtenerPlanoPorNombreYIdSucursal(string nombre, Guid IdSucursal);
        public Task<Plano?> ObtenerPlanoPorId(Guid IdPlano);    
        public Task<IEnumerable<Plano>> BuscarListaDePlanos(Guid IdSucursal);
        public Task<Plano> ActualizarPlano(Plano planoActualizado); 
        public Task<bool> EliminarPlano(Plano planoAEliminar);
    }
}
