namespace BackEndAPI.Models
{
    public class CuentaCorriente
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; }
        public string Telefono { get; set; }
        public string Domicilo { get; set; }
        public decimal Balance { get; set; }
        public decimal Descuento { get; set; }

        //navegacion
        public ICollection<MovimientosCuentaCorriente> Movimientos { get; set; } = new List<MovimientosCuentaCorriente>();

    }
}
