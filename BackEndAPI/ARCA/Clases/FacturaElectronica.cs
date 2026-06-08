namespace BackEndAPI.ARCA.Clases
{
    public class FacturaElectronica
    {
        public Guid Id { get; set; }
        public int PuntoVenta { get; set; }
        public int TipoComprobante { get; set; }
        public long NumeroComprobante { get; set; }
        public string Cae { get; set; } = "";
        public DateTime FechaEmision { get; set; }
        public DateTime FechaVencimientoCae { get; set; }
        public decimal Total { get; set; }
        public string JsonSolicitud { get; set; } = "";
        public string XmlRespuesta { get; set; } = "";
    }
}
