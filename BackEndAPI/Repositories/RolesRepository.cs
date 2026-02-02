using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class RolesRepository : IRolesRepository
    {
        private readonly ICurrentDbContext _currentDbContext;
        private readonly AppDbContext db;
        public RolesRepository(ICurrentDbContext currentDbContext)
        {
            _currentDbContext = currentDbContext;
            db = _currentDbContext.Db;
        }

        public async Task<IEnumerable<Rol>> GetAllRoles()
        {
            return await db.Roles.ToListAsync();
        }

        public async Task<Rol?> GetRolPorId(int id)
        {
            return await db.Roles.FirstOrDefaultAsync(r => r.Id == id);
        }
    }
}
