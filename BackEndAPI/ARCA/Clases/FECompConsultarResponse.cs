namespace BackEndAPI.ARCA.Clases
{
    public class FECompConsultarResponse
    {
        public long NumeroComprobante { get; set; }
        public int PuntoVenta { get; set; }
        public int TipoComprobante { get; set; }
        public string Resultado { get; set; } = string.Empty;
        public string Cae { get; set; } = string.Empty;
        public string CaeVencimiento { get; set; } = string.Empty;
        public decimal ImporteTotal { get; set; }
        public DateTime FechaComprobante { get; set; }
        public int DocTipo { get; set; }
        public long DocNro { get; set; }
    }
}
