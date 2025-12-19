using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IMenuRepository
    {
        Task<Menu> CrearMenu(Menu menu);
    }
}
