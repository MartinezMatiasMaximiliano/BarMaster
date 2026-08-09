namespace BackEndAPI.DTOs.Response
{
    public class MovimientoCajaDTO
    {
        public Guid Id { get; set; }
        public TipoMovimientoCajaDTO TipoMovimientoCaja { get; set; } = null!;
        public Guid IdCaja { get; set; }
        public decimal MontoAbonado { get; set; }
        public decimal Vuelto { get; set; }
        public decimal MontoTotal { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public DateTime FechaMovimiento { get; set; }
    }
}

