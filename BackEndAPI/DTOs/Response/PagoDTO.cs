using BackEndAPI.Models;

namespace BackEndAPI.DTOs.Response
{
    public class PagoDTO
    {
        public Guid Id { get; set; }
        public Guid IdVisita { get; set; }
        public TipoMovimientoCaja? tipoMovimientoCaja { get; set; }
        public decimal MontoAbonado { get; set; }
        public decimal Vuelto { get; set; }
        public decimal MontoTotal { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}
