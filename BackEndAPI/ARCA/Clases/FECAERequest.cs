namespace BackEndAPI.ARCA.Clases
{
    //clase para enviar la solicitud de CAE (Codigo de Autorización Electrónica) a AFIP
    public class FECAERequest
    {
        public int Concepto { get; set; }
        public int DocTipo { get; set; }
        public long DocNro { get; set; }
        public int CondicionIVAReceptorId { get; set; }
        public long CbteDesde { get; set; }
        public long CbteHasta { get; set; }
        public DateTime CbteFch { get; set; }
        public decimal ImpTotal { get; set; }
        public decimal ImpTotConc { get; set; }
        public decimal ImpNeto { get; set; }
        public decimal ImpOpEx { get; set; }
        public decimal ImpIVA { get; set; }
        public decimal ImpTrib { get; set; }
        public string MonId { get; set; } = "PES";
        public decimal MonCotiz { get; set; } = 1;
    }
}
