namespace BackEndAPI.Models
{
    public class Empresa
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombre { get; set; } = null!;
        public string[]? Telefonos { get; set; }
        public string[]? Emails { get; set; }
        public bool Activo { get; set; } = false;
        public DateTime FechaInscripcion { get; set; } = DateTime.UtcNow;

        //navegacion
        public Persona? Dueno { get; set; }
        public ICollection<Sucursal> Sucursales { get; set; } = new List<Sucursal>();
        public ICollection<Persona> Personas { get; set; } = new List<Persona>();


    }
}
//TODO: DECIDIR QUE TIPO DE MODELO USAMOS PARA LA SUBSCRIPCION
//public short IdTipoSubscripcion { get; set; }
//public TipoSubscripcion TipoSubscripcion { get; set; } = null!;


