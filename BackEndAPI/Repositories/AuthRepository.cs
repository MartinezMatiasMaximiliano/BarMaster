using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ApiDbContext _context;
        public AuthRepository(ApiDbContext context)
        {
            _context = context;
        }
        public async Task<Sucursal> LoginSucursal(string Username)
        {
            return await _context.Sucursales.FirstOrDefaultAsync(s => s.Username == Username);
        }
    }
}
