namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ConfigurarStockDTO
    {
        public bool ControlaStock { get; set; }

        public int CantidadMinima { get; set; }

        public int? CantidadInicial { get; set; }
    }
}
