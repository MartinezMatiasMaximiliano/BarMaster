namespace BackEndAPI.Models
{
    public class Plano
    {
        public Guid Id { get; set; }
        public Guid IdSucursal { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Detalles { get; set; }


        //navegacion
        public Sucursal Sucursal { get; set; } = null!;   
        public ICollection<Mesa> Mesas { get; set; } = new List<Mesa>();
    }
}
