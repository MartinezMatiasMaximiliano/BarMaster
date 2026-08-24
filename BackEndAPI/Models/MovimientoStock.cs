namespace BackEndAPI.Models
{
    public class MovimientoStock
    {
        public long Id { get; set; }
        public Guid IdStockProductoSucursal { get; set; }
        public string Tipo { get; set; } = null!;
        public CanalMovimientoStock Canal { get; set; } = CanalMovimientoStock.Manual;
        public int Cantidad { get; set; }
        public int StockAnterior { get; set; }
        public int StockPosterior { get; set; }
        public DateTime Fecha { get; set; } = DateTime.UtcNow;
        public string? Motivo { get; set; }
        public Guid? IdVisita { get; set; }
        public Guid? IdMesa { get; set; }
        public string? NombreMesa { get; set; }
        public string? NombreMozo { get; set; }

        public StockProductoSucursal StockProductoSucursal { get; set; } = null!;
        public Visita? Visita { get; set; }
        public Mesa? Mesa { get; set; }
    }
}
