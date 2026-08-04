using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IPagosServices
    {
        Task<MovimientoCaja> PagarProductos(CrearPagoDTO infoPago, bool emitirFactura, bool marcarPago);
    }
}
