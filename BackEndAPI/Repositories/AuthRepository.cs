using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ICurrentDbContext _context;
        private readonly AppDbContext db;
        public AuthRepository(ICurrentDbContext context)
        {
            _context = context;
            db = context.Db;
        }
        public async Task<Sucursal> LoginSucursal(string Username)
        {
            return await db.Sucursales.FirstOrDefaultAsync(s => s.Username == Username);
        }
    }
}
