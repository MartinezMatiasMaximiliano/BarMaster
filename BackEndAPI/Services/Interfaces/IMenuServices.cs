using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IMenuServices
    {
        Task<Menu> CrearMenu(CrearMenuDTO nuevoMenu);
    }
}
