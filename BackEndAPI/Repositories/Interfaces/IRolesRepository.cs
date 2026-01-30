using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IRolesRepository
    {
        Task<IEnumerable<Rol>> GetAllRoles();
        Task<Rol?> GetRolPorId(int id);
    }
}
