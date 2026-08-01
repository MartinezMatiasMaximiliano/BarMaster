namespace BackEndAPI.ARCA.Clases
{
    public class DatosParaFactura
    {
        public int concepto { get; set; }
        public int TipoDocumentoCliente { get; set; }
        public int NumeroDocumentoCliente { get; set; }
        public int CondicionIVAReceptor { get; set; }
        public int PuntoDeVenta { get; set; }
        public int TipoDeComprobante { get; set; }
        public decimal descuentoDecimal { get; set; } = decimal.Zero;
        public decimal recargoDecimal { get; set; } = decimal.Zero;
        public decimal descuentoPorcentaje { get; set; } = decimal.Zero;
        public decimal recargoPorcentaje { get; set; } = decimal.Zero;

    }
}
