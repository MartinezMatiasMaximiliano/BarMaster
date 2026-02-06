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
            if (dto.IdsProductos == null || dto.IdsProductos.Count == 0)
            {
                throw new Exception("Debe proporcionar al menos un producto");
            }
            if (dto.IdsProductos.Any(id => id == Guid.Empty))
            {
                throw new Exception("Uno o más Ids de productos están vacíos");
            }
            if (string.IsNullOrWhiteSpace(dto.Accion))
            {
                throw new Exception("La acción no puede estar vacía");
            }
            if (!dto.Accion.Equals("Agregar", StringComparison.OrdinalIgnoreCase) && 
                !dto.Accion.Equals("Eliminar", StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception("La acción debe ser 'Agregar' o 'Eliminar'");
            }

            // Validar que el menú existe
            var menu = await _menuRepository.ObtenerMenuPorId(dto.IdMenu);
            if (menu == null)
            {
                throw new Exception("Menú no encontrado");
            }

            // Validar que todos los productos existen
            var productosExistentes = await _productosRepository.GetAllProductosAsync();
            var idsProductosExistentes = productosExistentes.Select(p => p.Id).ToList();
            var productosNoEncontrados = dto.IdsProductos.Except(idsProductosExistentes).ToList();
            
            if (productosNoEncontrados.Any())
            {
                throw new Exception($"Los siguientes productos no fueron encontrados: {string.Join(", ", productosNoEncontrados)}");
            }

            // Validaciones específicas según la acción
            if (dto.Accion.Equals("Agregar", StringComparison.OrdinalIgnoreCase))
            {
                // Verificar si algún producto ya está en el menú
                var productosYaEnMenu = menu.Productos.Where(p => dto.IdsProductos.Contains(p.Id)).ToList();
                if (productosYaEnMenu.Any())
                {
                    var nombresProductos = productosYaEnMenu.Select(p => p.Nombre).ToList();
                    throw new Exception($"Los siguientes productos ya están en el menú: {string.Join(", ", nombresProductos)}");
                }
            }
            else if (dto.Accion.Equals("Eliminar", StringComparison.OrdinalIgnoreCase))
            {
                // Verificar que los productos estén en el menú
                var productosEnMenu = menu.Productos.Where(p => dto.IdsProductos.Contains(p.Id)).ToList();
                
                if (productosEnMenu.Count == 0)
                {
                    throw new Exception("Ninguno de los productos especificados está en el menú");
                }

                // Verificar si algún producto no está en el menú
                var productosNoEnMenu = dto.IdsProductos.Except(productosEnMenu.Select(p => p.Id)).ToList();
                if (productosNoEnMenu.Any())
                {
                    var productosNoEncontradosEnMenu = productosExistentes
                        .Where(p => productosNoEnMenu.Contains(p.Id))
                        .Select(p => p.Nombre)
                        .ToList();
                    throw new Exception($"Los siguientes productos no están en el menú: {string.Join(", ", productosNoEncontradosEnMenu)}");
                }
            }

            // Obtener los productos de la base de datos
            var productos = (await _productosRepository.GetAllProductosAsync())
                .Where(p => dto.IdsProductos.Contains(p.Id))
                .ToList();

            // Si todas las validaciones pasan, ejecutar la operación en el repositorio
            return await _menuRepository.ModificarProductosMenu(menu, productos, dto.Accion);
        }
    }
}