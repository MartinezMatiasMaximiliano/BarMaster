using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IMenuServices
    {
        Task<ICollection<Menu>> ObtenerMenusPorSucursal(Guid idSucursal);
        Task<Menu?> ObtenerMenuPorId(Guid idMenu);
        Task<Menu> CrearMenu(CrearMenuDTO nuevoMenu);
        Task<Menu> ActivarDesactivarMenu(Guid idMenu, bool activar);
        Task<Menu> ActualizarMenu(ModificarMenuDTO actualizarMenu);
        Task<bool> EliminarMenu(Guid idMenu);
    }
}
