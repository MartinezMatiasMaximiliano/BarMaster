using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class SucursalRepository : ISucursalRepository
    {
        private readonly ApiDbContext _context;
        public SucursalRepository(ApiDbContext context)
        {
            _context = context;
        }


        public async Task<Sucursal?> GetSucursalById(Guid id)
        {
            return await _context.Sucursales.FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Sucursal?> GetSucursalByUsername(string username)
        {
            return await _context.Sucursales.FirstOrDefaultAsync(s => s.Username == username);
        }

        public async Task<Sucursal?> CrearSucursal(Sucursal sucursal)
        {
            await _context.Sucursales.AddAsync(sucursal);
            await _context.SaveChangesAsync();
            return sucursal;
        }

        public async Task<bool> EliminarSucursal(Guid id)
        {
            var sucursal = await _context.Sucursales.FirstOrDefaultAsync(s => s.Id == id);
            if (sucursal != null)
            {
                _context.Sucursales.Remove(sucursal);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;

        }
    }
}
