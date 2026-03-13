namespace BackEndAPI.DTOs.Response
{
    public class TicketVirtualDTO
    {
        public Guid Id { get; set; }
        public decimal Monto { get; set; }
        public DateTime FechaMovimiento { get; set; }
        public string? NombreMesa { get; set; }
        public string? NombreSucursal { get; set; }
        public string? NombreMozo { get; set; }
        public string? TipoPago { get; set; }
        public List<TicketVirtualProductoDTO> Productos { get; set; } = new();
    }

    public class TicketVirtualProductoDTO
    {
        public string Nombre { get; set; } = string.Empty;
        public decimal Precio { get; set; }
    }
}
