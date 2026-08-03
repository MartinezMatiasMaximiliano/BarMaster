namespace BackEndAPI.Models
{
    public class CuentaCorriente
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; }
        public string Telefono { get; set; }
        public string Domicilo { get; set; }
        public bool Activa { get; set; } = true;
        public decimal Balance { get; set; } = 0;
        public decimal Descuento { get; set; } = 0; 

        //navegacion
        public ICollection<MovimientosCuentaCorriente> Movimientos { get; set; } = new List<MovimientosCuentaCorriente>();

    }
}
