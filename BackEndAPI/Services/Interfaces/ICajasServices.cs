using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface ICajasServices
    {
        Task<Caja> CrearCaja(CrearCajaDTO request,Guid IdSucursal);

        Task<Caja> BuscarCajaAbierta();

        Task<Caja> CerrarCaja(Guid IdCaja, decimal MontoCierre);
        
        Task<List<Caja>> BuscarListaCajas();
        
        Task<Caja> BuscarCajaPorId(Guid id);
    }
}
