using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class MenuRepository : IMenuRepository
    {
        private readonly ICurrentDbContext _context;
        private readonly AppDbContext db;
        public MenuRepository(ICurrentDbContext context)
        {
            _context = context;
            db = context.Db;
        }

        public async Task<Menu> CrearMenu(Menu menu)
        {
            await db.Menus.AddAsync(menu);
            await db.SaveChangesAsync();
            return menu;
        }

        public async Task<Menu?> ObtenerMenuPorId(Guid idMenu)
        {
            return await db.Menus.FirstOrDefaultAsync(m => m.Id == idMenu);
        }

        public async Task<Menu> ModificarMenu(Menu menuActualizado)
        {
            db.Entry(menuActualizado).State = EntityState.Modified;
            await db.SaveChangesAsync();
            return menuActualizado;
        }

        public async Task<IEnumerable<Menu>> ObtenerTodosLosMenus()
        {
            return await db.Menus
                .Include(m => m.Sucursal)
                .ToListAsync();
        }

        public async Task<bool> EliminarMenu(Menu menu)
        {
            db.Menus.Remove(menu);
            await db.SaveChangesAsync();
            return true;
        }
    }
}
