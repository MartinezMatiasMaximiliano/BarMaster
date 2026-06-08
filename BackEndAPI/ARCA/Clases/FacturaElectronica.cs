namespace BackEndAPI.ARCA.Clases
{
    public class FacturaElectronica
    {
        public Guid Id { get; set; } = new Guid();
        public int PuntoVenta { get; set; }
        public int TipoComprobante { get; set; }
        public long NumeroComprobante { get; set; }
        public string CAE { get; set; } = "";
        public DateTime CAEFechaEmision { get; set; }
        public DateTime CAEFechaVencimiento { get; set; }
        public decimal Total { get; set; }
        public string JsonSolicitud { get; set; } = "";
        public string XmlRespuesta { get; set; } = "";
    }
}
