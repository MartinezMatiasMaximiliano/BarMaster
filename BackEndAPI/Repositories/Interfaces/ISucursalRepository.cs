using BackEndAPI.Models;
namespace BackEndAPI.Repositories.Interfaces
{
    public interface ISucursalRepository
    {
        Task<Sucursal?> GetSucursalById(Guid id);
        Task<Sucursal?> GetSucursalByUsername(string username);
        Task<Sucursal?> CrearSucursal(Sucursal sucursal);
        Task<bool> EliminarSucursal(Guid id);
    }
}
