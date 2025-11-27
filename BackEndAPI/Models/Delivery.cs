namespace BackEndAPI.Models
{
    public class Delivery
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime FechaHora { get; set; } = DateTime.Now;
        public string NombreCliente { get; set; } = null!;
        public string Direccion { get; set; } = null!;  
        public string? Indicaciones { get; set; } 
        public string Telefono { get; set; } = null!;
        public double PrecioTotal { get; set; }



        //Foreign Keys
        public Guid IdCaja { get; set; }
        public Guid IdPago { get; set; }
        public Guid IdPersonaRegistro { get; set; } 
        public Guid IdCadete { get; set; }
        public int IdTipoEnvio { get; set; }
        public bool Entregado { get; set; }
        
        //Navegacion
        public Caja Caja { get; set; }
        public Pago Pago { get; set; }
        public Persona PersonaRegistro { get; set; }
        public Persona Cadete {  get; set; }
        public TipoEnvio TipoEnvio { get; set; }


        public double CalcularTotal()
        {
            throw new NotImplementedException();
        }

    }
}
