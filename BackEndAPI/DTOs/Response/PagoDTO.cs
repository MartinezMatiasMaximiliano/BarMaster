using BackEndAPI.Models;

namespace BackEndAPI.DTOs.Response
{
    public class PagoDTO
    {
        public Guid Id { get; set; }
        public Guid IdVisita { get; set; }
        public TipoMovimientoCaja? tipoMovimientoCaja { get; set; }
        public decimal Monto { get; set; }
        public decimal? Vuelto { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}
