using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IMenuRepository
    {
        Task<Menu> CrearMenu(Menu menu);
        Task<Menu?> ObtenerMenuPorId(Guid idMenu);
        Task<Menu> ModificarMenu(Menu menuActualizado);
        Task<IEnumerable<Menu>> ObtenerTodosLosMenus();
        Task<bool> EliminarMenu(Menu menu);
    }
}
