using BackEndAPI.ARCA.Clases;

namespace BackEndAPI.DTOs.Request.Crear
{
    public class CrearPagoDTO
    {
        public int IdTipoMovimiento { get; set; }
        public Guid IdVisita { get; set; }
        public decimal MontoAbonado { get; set; }
        public decimal descuentoDecimal { get; set; } = decimal.Zero;
        public decimal recargoDecimal { get; set; } = decimal.Zero;
        public decimal descuentoPorcentaje { get; set; } = decimal.Zero;
        public decimal recargoPorcentaje { get; set; } = decimal.Zero;
        public bool GenerarFactura { get; set; } = false;
        public DatosParaFactura? DatosFacturaARCA { get; set; }
        public ICollection<int> ListaIdsProductos { get; set; } = new List<int>();
    }
}
