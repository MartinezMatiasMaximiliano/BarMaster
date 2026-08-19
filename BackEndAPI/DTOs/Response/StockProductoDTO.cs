namespace BackEndAPI.DTOs.Response
{
    public class StockProductoDTO
    {
        public Guid IdProducto { get; set; }
        public string? CodigoProducto { get; set; }
        public string NombreProducto { get; set; } = null!;
        public Guid IdSucursal { get; set; }
        public bool ControlaStock { get; set; }
        public bool EnviarAlerta { get; set; }
        public int CantidadActual { get; set; }
        public int CantidadMinima { get; set; }
        public bool SinStock => ControlaStock && CantidadActual == 0;
        public bool StockBajo => ControlaStock && CantidadActual <= CantidadMinima;
        public bool Disponible => !ControlaStock || CantidadActual > 0;
        public DateTime? FechaActualizacion { get; set; }
    }
}
