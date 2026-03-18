using System.Security.Policy;

namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ModificarDeliveryTakeawayDTO
    {
        public Guid IdDeliveryTakeaway{ get; set; }
        public string? NombreCliente { get; set; }
        public string? Telefono { get; set; }
        public string? Direccion { get; set; }
        public string? Indicaciones { get; set; } 
        public bool Entregado { get; set; } = false;


    }
}
