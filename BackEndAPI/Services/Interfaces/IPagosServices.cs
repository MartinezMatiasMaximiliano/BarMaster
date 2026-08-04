using BackEndAPI.ARCA.Clases;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IPagosServices
    {
        Task<(MovimientoCaja,FacturaElectronica)> PagarProductos(CrearPagoDTO infoPago);
    }
}
