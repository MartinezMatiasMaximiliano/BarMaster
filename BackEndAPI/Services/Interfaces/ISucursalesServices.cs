using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface ISucursalesServices
    {
        Task<Sucursal?> CrearSucursal(CrearSucursalDTO nuevaSucursal);
    }
}
