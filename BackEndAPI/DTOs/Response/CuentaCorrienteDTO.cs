using BackEndAPI.Models;

namespace BackEndAPI.DTOs.Response
{
    public class CuentaCorrienteDTO
    { 
        public Guid Id { get; set; }
        public string Nombre { get; set; }
        public string Telefono { get; set; }
        public string Domicilo { get; set; }
        public decimal Balance { get; set; } = 0;
        public decimal Descuento { get; set; } = 0;

        public ICollection<MovimientoCuentaCorrienteDTO> Movimientos { get; set; } = new List<MovimientoCuentaCorrienteDTO>();
    }
}
