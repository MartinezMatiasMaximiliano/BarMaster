using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class RolesServices : IRolesServices
    {
        private readonly IRolesRepository _rolesRepository;
        public RolesServices(IRolesRepository rolesRepository)
        {
            _rolesRepository = rolesRepository;
        }

        public async Task<IEnumerable<Rol>> BuscarListaRoles()
        {
            return await _rolesRepository.GetAllRoles();
        }

        public async Task<Rol> BuscarRolPorId(int id)
        {
            var rol = await _rolesRepository.GetRolPorId(id);
            if (rol == null)
            {
                throw new Exception("El rol no existe");
            }
            return rol;
        }
    }
}
