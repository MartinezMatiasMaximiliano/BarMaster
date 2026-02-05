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
        public MenuServices(IMenuRepository menuRepository)
        {
            _menuRepository = menuRepository;
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

        public async Task<Menu> ModificarMenu(ModificarMenuDTO request)
        {
            // Validaciones
            if (request.Id == Guid.Empty)
            {
                throw new Exception("El Id del menú no puede estar vacío");
            }

            var menuExistente = await _menuRepository.ObtenerMenuPorId(request.Id);
            if (menuExistente == null)
            {
                throw new Exception("Menú no encontrado");
            }

            // Actualizar solo los campos proporcionados
            if (!string.IsNullOrWhiteSpace(request.Nombre))
            {
                menuExistente.Nombre = request.Nombre;
            }

            if (request.Activo.HasValue)
            {
                menuExistente.Activo = request.Activo.Value;
            }

            return await _menuRepository.ModificarMenu(menuExistente);
        }

        public async Task<IEnumerable<Menu>> ObtenerTodosLosMenus()
        {
            return await _menuRepository.ObtenerTodosLosMenus();
        }

        public async Task<bool> EliminarMenu(Guid IdMenu)
        {
            // Validaciones
            if (IdMenu == Guid.Empty)
            {
                throw new Exception("El Id del menú no puede estar vacío");
            }

            var menuAEliminar = await _menuRepository.ObtenerMenuPorId(IdMenu);
            if (menuAEliminar == null)
            {
                throw new Exception("Menú no encontrado");
            }

            // Verificar si el menú tiene productos asociados
            // Nota: Esto requeriría incluir los productos en ObtenerMenuPorId si queremos validar
            // Por ahora, la eliminación en cascada se manejará en la DB si está configurada

            return await _menuRepository.EliminarMenu(menuAEliminar);
        }
    }
}