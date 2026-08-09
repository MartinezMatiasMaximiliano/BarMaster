using BackEndAPI.ARCA.Clases;

namespace BackEndAPI.Models
{
    public class MovimientoCaja
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public int IdTipoMovimientoCaja { get; set; } 
        public Guid IdCaja { get; set; }
        public Guid? IdVisita {  get; set; }
        public decimal MontoAbonado { get; set; }
        public decimal Vuelto { get; set; } = decimal.Zero;
        public decimal MontoTotal { get; set; } 
        public string Descripcion { get; set; } = string.Empty;
        public bool Facturado { get; set; } = false;
        public Guid? IdFactura { get; set; } = null;
        public DateTime FechaMovimiento { get; set; } = DateTime.UtcNow;


        //navegacion
        public TipoMovimientoCaja TipoMovimientoCaja { get; set; } = null!;
        public FacturaElectronica? facturaElectronica { get; set; }
        public Visita? Visita { get; set; }
        public Caja Caja { get; set; } = null!;

    }
}
