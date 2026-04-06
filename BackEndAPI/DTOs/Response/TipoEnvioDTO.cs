namespace BackEndAPI.DTOs.Response
{
    public class TipoEnvioDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public string Vehiculo { get; set; } = string.Empty;
    }
}
