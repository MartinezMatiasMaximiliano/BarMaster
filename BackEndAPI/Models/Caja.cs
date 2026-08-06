namespace BackEndAPI.Models
{
    public class Caja
    {
        //propiedades
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IdSucursal { get; set; }
        public DateTime FechaApertura { get; set; } = DateTime.UtcNow;
        public DateTime? FechaCierre { get; set; }
        public decimal MontoApertura { get; set; }
        public decimal MontoActual {  get; set; } 
        public decimal? MontoCierre { get; set; }
        public decimal? Diferencia { get; set; }


        //navegacion
        public Sucursal Sucursal { get; set; } = null!;
        public ICollection<Visita> Visitas { get; set; } = new List<Visita>();
        public ICollection<MovimientoCaja> MovimientosCaja { get; set; } = new List<MovimientoCaja>();

        public decimal CalcularDiferencia()
        {
            if (MontoCierre.HasValue)
            {
                return (decimal)(MontoCierre.Value - MontoApertura);
            }
            return 0;
        }
    public decimal CalcularTotalMovimientos()
        { 
            var movimientosEfectivo = MovimientosCaja
                .Where(m => m.TipoMovimientoCaja.EsEfectivo == true)
                .Sum(m => m.MontoTotal);
            return movimientosEfectivo;
        }
    }
}
