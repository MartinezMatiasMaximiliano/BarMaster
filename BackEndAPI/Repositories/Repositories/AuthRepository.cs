using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ApiDbContext _context;
        public AuthRepository(ApiDbContext context)
        {
            _context = context;
        }


        public Task<string> Login(string telefono, string password)
        {
            throw new NotImplementedException();
        }

        public async Task<Sucursal> LoginSucursal(string password)
        {
           
            return await _context.Sucursales.FirstOrDefaultAsync(s => s.Password == password);

        }

        public Task<string> Register(string telefono, string password, int rolId, Guid? idSucursal = null)
        {
            throw new NotImplementedException();
        }

        public Task<bool> SucursalExists()
        {
            throw new NotImplementedException();
        }

        public Task<bool> UserExists(string telefono)
        {
            throw new NotImplementedException();
        }
    }
}
