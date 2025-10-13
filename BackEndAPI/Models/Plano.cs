namespace BackEndAPI.Models
{
    public class Plano
    {
        public Guid Id { get; set; }
        public string nombre { get; set; } = null!;
        public string? detalles { get; set; }

        //Foreign Key
        public Guid IdSucursal { get; set; }

        //navegacion
        public Sucursal Sucursal { get; set; } = null!;   
        public ICollection<Mesa> Mesas { get; set; } = new List<Mesa>();
    }
}
