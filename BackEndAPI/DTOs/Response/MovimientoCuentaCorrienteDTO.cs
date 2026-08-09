namespace BackEndAPI.DTOs.Response
{
    public class MovimientoCuentaCorrienteDTO
    {
        public Guid IdMovimientoCaja { get; set; }
        public string Descripcion { get; set; }
        public decimal MontoTotal { get; set; }
        public DateTime FechaMovimiento { get; set; }
        public bool EsIngreso { get; set; }
        public bool EsEfectivo { get; set; }

    }
}
