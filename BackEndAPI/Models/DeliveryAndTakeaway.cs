namespace BackEndAPI.Models
{
    public class DeliveryAndTakeaway
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IdSucursal { get; set; }
        //public Guid IdPersonaRegistro { get; set; }
        public Guid? IdCadete { get; set; }
        public int? IdTipoEnvio { get; set; }
        public Guid IdVisita { get; set; }
        public DateTime FechaHora { get; set; } = DateTime.UtcNow;
        public string NombreCliente { get; set; } = null!;
        public string? Direccion { get; set; } = null;  
        public string? Indicaciones { get; set; } 
        public string? Telefono { get; set; } = null!;
        public decimal PrecioEnvio { get; set; }
        public decimal precioProductos { get; set; }
        public decimal PrecioTotal { get; set; }
        public bool Entregado { get; set; }
        

        //Navegacion
        public Sucursal Sucursal { get; set; }
        public Visita Visita { get; set; }
        //public Persona PersonaRegistro { get; set; }
        public Persona Cadete {  get; set; }
        public TipoEnvio TipoEnvio { get; set; }


        public decimal CalcularTotal()
        {
            throw new NotImplementedException();        }

    }
}
