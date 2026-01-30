using BackEndAPI.Models;

namespace BackEndAPI.DTOs.Response
{
    public class PagoDTO
    {
        public Guid Id { get; set; }
        public Guid IdVisita { get; set; }
        public TipoPago? tipoPago { get; set; }
        public decimal Monto { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}
