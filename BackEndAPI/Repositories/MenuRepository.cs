using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;

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

    }
}
