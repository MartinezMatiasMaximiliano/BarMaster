using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IPagosServices
    {
        Task<Pago> PagarProductos(CrearPagoDTO InfoPago);
    }
}
