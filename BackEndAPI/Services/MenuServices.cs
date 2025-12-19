using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;
using NuGet.Versioning;

namespace BackEndAPI.Services
{
    public class MenuServices : IMenuServices
    {
        private readonly IMenuRepository _menuRepository;
        public MenuServices(IMenuRepository menuRepository)
        {
            _menuRepository = menuRepository;
        }

        public async Task<Menu> CrearMenu(CrearMenuDTO nuevoMenu)
        {
            Menu menu = new Menu
            {
                Nombre = nuevoMenu.Nombre,
                IdSucursal = nuevoMenu.IdSucursal,
                Activo = false
            };



            return await _menuRepository.CrearMenu(menu);
        }
    }
}