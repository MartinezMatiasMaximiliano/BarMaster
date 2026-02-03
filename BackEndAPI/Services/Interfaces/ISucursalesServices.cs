using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface ISucursalesServices
    {
        Task<Sucursal?> CrearSucursal(CrearSucursalDTO nuevaSucursal,Guid IdEmpresa);
        Task<Sucursal?> BuscarSucursalPorId(Guid IdSucursal);
        Task<Sucursal?> ActualizarSucursal(Guid IdSucursal, ModificarSucursalDTO actualizarSucursal);
    }
}
