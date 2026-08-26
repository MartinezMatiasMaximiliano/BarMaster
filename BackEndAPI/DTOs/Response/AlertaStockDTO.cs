namespace BackEndAPI.DTOs.Response
{
    public class AlertaStockDTO
    {
        public Guid IdProducto { get; set; }
        public string? CodigoProducto { get; set; }
        public string NombreProducto { get; set; } = null!;
        public int CantidadActual { get; set; }
        public int CantidadMinima { get; set; }
        public DateTime FechaInicioStockBajo { get; set; }
    }
}
