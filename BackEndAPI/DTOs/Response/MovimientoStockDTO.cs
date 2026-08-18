namespace BackEndAPI.DTOs.Response
{
    public class MovimientoStockDTO
    {
        public long Id { get; set; }
        public Guid IdProducto { get; set; }
        public string NombreProducto { get; set; } = null!;
        public string Tipo { get; set; } = null!;
        public string Canal { get; set; } = null!;
        public int Cantidad { get; set; }
        public int StockAnterior { get; set; }
        public int StockPosterior { get; set; }
        public DateTime Fecha { get; set; }
        public string? Motivo { get; set; }
        public Guid? IdVisita { get; set; }
    }
}
