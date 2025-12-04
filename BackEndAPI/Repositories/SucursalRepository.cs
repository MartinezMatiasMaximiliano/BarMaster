using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class SucursalRepository : ISucursalRepository
    {
        private readonly ICurrentDbContext _context;
        private readonly AppDbContext db;
        public SucursalRepository(ICurrentDbContext context)
        {
            _context = context;
            db = context.Db;
        }


        public async Task<Sucursal?> GetSucursalById(Guid id)
        {
            return await db.Sucursales.FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Sucursal?> GetSucursalByUsername(string username)
        {
            return await db.Sucursales.FirstOrDefaultAsync(s => s.Username == username);
        }

        public async Task<Sucursal?> CrearSucursal(Sucursal sucursal)
        {
            await db.Sucursales.AddAsync(sucursal);
            await db.SaveChangesAsync();
            return sucursal;
        }

        public async Task<bool> EliminarSucursal(Guid id)
        {
            var sucursal = await db.Sucursales.FirstOrDefaultAsync(s => s.Id == id);
            if (sucursal != null)
            {
                db.Sucursales.Remove(sucursal);
                await db.SaveChangesAsync();
                return true;
            }
            return false;

        }
    }
}
