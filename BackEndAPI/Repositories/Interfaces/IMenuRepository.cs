using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IMenuRepository
    {
        Task<Menu?> ObtenerMenuPorId(Guid idMenu);
        Task<ICollection<Menu>> ObtenerMenusPorSucursal(Guid idSucursal);
        Task<Menu> CrearMenu(Menu menu);
        Task<Menu> ActualizarMenu(Menu menu);
        Task<bool> EliminarMenu(Menu menu);
        Task<Menu> ModificarProductosMenu(Menu menu, List<Producto> productos, string accion);
    }
}
