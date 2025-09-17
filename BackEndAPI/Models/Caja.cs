namespace BackEndAPI.Models
{
    public class Caja
    {
        public Guid Id { get; set; }
        public DateTime FechaApertura { get; set; }
        public DateTime FechaCierre { get; set; }
        public decimal Total { get; set; }
        public Guid IdSucursal { get; set; }

        //navegacion
        public Sucursal Sucursal { get; set; } = null!;
        public ICollection<Visita> Visitas { get; set; } = new List<Visita>();
    }
}
