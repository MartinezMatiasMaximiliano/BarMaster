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
    }
}
