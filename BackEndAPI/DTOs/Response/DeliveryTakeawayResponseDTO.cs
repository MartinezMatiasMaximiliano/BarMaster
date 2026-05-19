namespace BackEndAPI.DTOs.Response
{
    public class DeliveryTakeawayResponseDTO
    {
        public Guid Id { get; set; }
        public Guid IdSucursal { get; set; }
        public int? IdTipoEnvio { get; set; }
        public Guid IdVisita { get; set; }
        public DateTime FechaHora { get; set; }
        public string NombreCliente { get; set; } = "";
        public string? Direccion { get; set; }
        public string? Indicaciones { get; set; }
        public string Telefono { get; set; } = "";
        public decimal PrecioTotal { get; set; }
        public decimal PrecioEnvio { get; set; }
        public bool Entregado { get; set; }
        public CadeteDTO? Cadete { get; set; } 
        public List<ItemDTO> Productos { get; set; } = new List<ItemDTO>();
    }
}
