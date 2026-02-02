using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IRolesServices
    {
        Task<IEnumerable<Rol>> BuscarListaRoles();
        Task<Rol> BuscarRolPorId(int id);
    }
}
