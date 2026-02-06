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
        public async Task<Menu?> ObtenerMenuPorId(Guid idMenu)
        {
            return await db.Menus.Include(m => m.Productos).FirstOrDefaultAsync(m => m.Id == idMenu);
        }
        public async Task<ICollection<Menu>> ObtenerMenusPorSucursal(Guid idSucursal)
        {
            return await db.Menus.Include(m => m.Productos).Where(m => m.IdSucursal == idSucursal).ToListAsync();
        }
        public async Task<Menu> CrearMenu(Menu menu)
        {
            await db.Menus.AddAsync(menu);
            await db.SaveChangesAsync();
            return menu;
        }
        public async Task<Menu> ActualizarMenu(Menu menu)
        {
            db.Entry(menu).State = EntityState.Modified;
            await db.SaveChangesAsync(); 
            return menu;
        }
        public async Task<bool> EliminarMenu(Menu menu)
        {
            db.Menus.Remove(menu);
            await db.SaveChangesAsync();
            return true;
        }

        public async Task<Menu> ModificarProductosMenu(Menu menu, List<Producto> productos, string accion)
        {
            if (accion.Equals("Agregar", StringComparison.OrdinalIgnoreCase))
            {
                foreach (var producto in productos)
                {
                    menu.Productos.Add(producto);
                }
            }
            else if (accion.Equals("Eliminar", StringComparison.OrdinalIgnoreCase))
            {
                var productosAQuitar = menu.Productos.Where(p => productos.Select(pr => pr.Id).Contains(p.Id)).ToList();
                foreach (var producto in productosAQuitar)
                {
                    menu.Productos.Remove(producto);
                }
            }

            await db.SaveChangesAsync();
            return menu;
        }
    }
}
