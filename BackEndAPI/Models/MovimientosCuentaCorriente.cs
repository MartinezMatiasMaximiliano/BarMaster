namespace BackEndAPI.Models
{
    public class MovimientosCuentaCorriente
    {
        public Guid IdCuentaCorriente { get; set; }
        public Guid IdMovimientoCaja { get; set; }


        public CuentaCorriente CuentaCorriente { get; set; } = null!;
        public MovimientoCaja MovimientoCaja { get; set; } = null!;
    }
}
