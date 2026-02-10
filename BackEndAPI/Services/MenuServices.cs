using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using System;
using System.Linq;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class MenuServices : IMenuServices
    {
        private readonly IMenuRepository _menuRepository;
        private readonly IProductosRepository _productosRepository;
        
        public MenuServices(IMenuRepository menuRepository, IProductosRepository productosRepository)
        {
            _menuRepository = menuRepository;
            _productosRepository = productosRepository;
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

        public async Task<Menu> ModificarProductosMenu(ModificarProductosMenuDTO dto)
        {
            // Validaciones del DTO
            if (dto.IdMenu == Guid.Empty)
            {
                throw new Exception("El Id del menú no puede estar vacío");
            }
            if (dto.IdsProductos == null)
            {
                throw new Exception("La lista de productos no puede ser nula");
            }
            if (dto.IdsProductos.Any(id => id == Guid.Empty))
            {
                throw new Exception("Uno o más Ids de productos están vacíos");
            }

            // Validar que el menú existe
            var menu = await _menuRepository.ObtenerMenuPorId(dto.IdMenu);
            if (menu == null)
            {
                throw new Exception("Menú no encontrado");
            }

            // Validar que todos los productos del estado final existen
            var productosExistentes = await _productosRepository.GetAllProductos();
            var idsProductosExistentes = productosExistentes.Select(p => p.Id).ToList();
            var productosNoEncontrados = dto.IdsProductos.Except(idsProductosExistentes).ToList();
            
            if (productosNoEncontrados.Any())
            {
                throw new Exception($"Los siguientes productos no fueron encontrados: {string.Join(", ", productosNoEncontrados)}");
            }

            // Calcular diferencia: qué productos agregar y qué productos quitar
            var idsActuales = menu.Productos.Select(p => p.Id).ToList();
            var idsParaAgregar = dto.IdsProductos.Except(idsActuales).ToList();
            var idsParaQuitar = idsActuales.Except(dto.IdsProductos).ToList();

            // Obtener los productos de la base de datos
            var productosParaAgregar = productosExistentes
                .Where(p => idsParaAgregar.Contains(p.Id))
                .ToList();
            
            var productosParaQuitar = menu.Productos
                .Where(p => idsParaQuitar.Contains(p.Id))
                .ToList();

            // Si todas las validaciones pasan, ejecutar la operación en el repositorio
            return await _menuRepository.ModificarProductosMenu(menu, productosParaAgregar, productosParaQuitar);
        }
    }
}