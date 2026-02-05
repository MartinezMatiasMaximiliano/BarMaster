using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class MenuServices : IMenuServices
    {
        private readonly IMenuRepository _menuRepository;
        public  MenuServices(IMenuRepository menuRepository)
        {
            _menuRepository = menuRepository;
        }
        public async Task<ICollection<Menu>> ObtenerMenusPorSucursal(Guid idSucursal)
        {
            var menus = await _menuRepository.ObtenerMenusPorSucursal(idSucursal);
            if(menus == null || menus.Count == 0) throw new Exception("No se encontraron menus para la sucursal indicada");
            return menus;
        }
        public async Task<Menu?> ObtenerMenuPorId(Guid idMenu)
        {
            var menu = await _menuRepository.ObtenerMenuPorId(idMenu);
            if(menu == null) throw new Exception("Menu no encontrado");
            return menu;
        }
        public async Task<Menu> CrearMenu(CrearMenuDTO nuevoMenu)
        {
            // Validaciones
            if (string.IsNullOrWhiteSpace(nuevoMenu.Nombre))
            {
                throw new Exception("El nombre del menú no puede estar vacío");
            }

            if (nuevoMenu.IdSucursal == Guid.Empty)
            {
                throw new Exception("El IdSucursal no puede estar vacío");
            }

            Menu menu = new Menu
            {
                Nombre = nuevoMenu.Nombre,
                IdSucursal = nuevoMenu.IdSucursal,
                Activo = true
            };
            return await _menuRepository.CrearMenu(menu);
        }
        public async Task<Menu> ActivarDesactivarMenu(Guid idMenu, bool activar)
        {
            var menu = await _menuRepository.ObtenerMenuPorId(idMenu);
            if (menu == null) throw new Exception("Menu no encontrado");
            menu.Activo = activar;
            return await _menuRepository.ActualizarMenu(menu); 
        }
        public async Task<Menu> ActualizarMenu(ModificarMenuDTO actualizarMenu)
        {
            if (actualizarMenu.IdMenu == Guid.Empty)
            {
                throw new Exception("El Id del menú no puede estar vacío");
            }
            var menu = await _menuRepository.ObtenerMenuPorId(actualizarMenu.IdMenu);
            if (menu == null) throw new Exception("Menu no encontrado");
            menu.Nombre = actualizarMenu.Nombre;
            return await _menuRepository.ActualizarMenu(menu);
        }

        public async Task<bool> EliminarMenu(Guid idMenu)
        {
            var menu = await _menuRepository.ObtenerMenuPorId(idMenu);
            if (menu == null) throw new Exception("Menu no encontrado");
            return await _menuRepository.EliminarMenu(menu);
        }
    }
}