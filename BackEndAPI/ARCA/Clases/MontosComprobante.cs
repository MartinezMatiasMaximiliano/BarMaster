namespace BackEndAPI.ARCA.Clases
{
    public class MontosComprobante
    {
        public decimal ImpNeto { get; set; }
        public decimal ImpIVA { get; set; }
        public decimal ImpTotal { get; set; }
        public decimal ImpTotConc { get; set; } = 0;
        public decimal ImpOpEx { get; set; } = 0;
        public decimal ImpTrib { get; set; } = 0;
        public List<DetalleIva> DetalleIva { get; set; } = new();
    }
}
