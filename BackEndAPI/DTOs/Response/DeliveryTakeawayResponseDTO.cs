namespace BackEndAPI.DTOs.Response
{
    /// <summary>
    /// DTO de respuesta para Delivery/Takeaway. Solo datos escalares + productos de la visita para evitar ciclos en la serialización JSON.
    /// </summary>
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
        public bool Entregado { get; set; }
        /// <summary>Productos de la visita (ProductosPorVisita) enlazada a este delivery/takeaway.</summary>
        public List<ItemDTO> Productos { get; set; } = new List<ItemDTO>();
    }
}
