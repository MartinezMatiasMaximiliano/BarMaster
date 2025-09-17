namespace BackEndAPI.Models
{
    public class PersonasSucursales
    {
        public int Id { get; set; }
        public Guid IdSucursal { get; set; }
        public Guid IdPersona { get; set; }

        //navegacion
        public Sucursal Sucursal { get; set; } = null!;
        public Persona Persona { get; set; } = null!;

    }
}
