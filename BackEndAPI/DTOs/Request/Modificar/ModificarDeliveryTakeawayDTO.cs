using BackEndAPI.Models;
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
        public int? IdTipoEnvio { get; set; }
        public Guid? IdCadete { get; set; }
        public IEnumerable<AgregarProductoAVisita>? ProductosAgregados { get; set; } = new List<AgregarProductoAVisita>();
        public IEnumerable<int>? ProductosEliminados { get; set; } = new List<int>();


    }
}
