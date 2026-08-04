using BackEndAPI.ARCA.Clases;
using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IPagosRepository
    {
        Task<(MovimientoCaja,FacturaElectronica)> CrearPago(Visita visita, MovimientoCaja pago,DatosParaFactura datosFactura, decimal totalProductosPagados,bool generarFactura,decimal montoAbonado);
    }
}
