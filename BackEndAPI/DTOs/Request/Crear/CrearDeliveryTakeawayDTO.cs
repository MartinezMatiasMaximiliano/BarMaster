using BackEndAPI.DTOs.Request.Modificar;

namespace BackEndAPI.DTOs.Request.Crear
{
    public class CrearDeliveryTakeawayDTO
    {
        public Guid? IdCadete { get; set; }
        public int? IdTipoEnvio { get; set; }
        public string NombreCliente { get; set; } = null;
        public string? Direccion { get; set; } = null;
        public string? Indicaciones { get; set; } = null;
        public string? Telefono { get; set; } = null;
        public string Origen { get; set; } = null!;  
        public List<AgregarProductoAVisita> ListaIDProductos { get; set; } = new List<AgregarProductoAVisita>();
    }
}
