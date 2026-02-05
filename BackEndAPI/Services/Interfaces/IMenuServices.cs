using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IMenuServices
    {
        Task<Menu> CrearMenu(CrearMenuDTO nuevoMenu);
        Task<Menu> ModificarMenu(ModificarMenuDTO request);
        Task<IEnumerable<Menu>> ObtenerTodosLosMenus();
        Task<bool> EliminarMenu(Guid IdMenu);
    }
}
