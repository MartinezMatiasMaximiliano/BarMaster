namespace BackEndAPI.Models
{
    public class Caja
    {
        //propiedades
        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime FechaApertura { get; set; } = DateTime.UtcNow;
        public DateTime FechaCierre { get; set; }
        public decimal MontoApertura { get; set; }
        public decimal MontoCierre { get; set; }
        public decimal Total { get; set; }

        //foreign key
        public Guid IdSucursal { get; set; }

        //navegacion
        public Sucursal Sucursal { get; set; } = null!;
        public ICollection<Visita> Visitas { get; set; } = new List<Visita>();
    }
}
