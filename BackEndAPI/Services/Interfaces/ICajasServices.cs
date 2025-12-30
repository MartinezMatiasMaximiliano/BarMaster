using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface ICajasServices
    {
        Task<Caja> CrearCaja(CrearCajaDTO request);

        Task<Caja> BuscarCajaAbierta();

    }
}
