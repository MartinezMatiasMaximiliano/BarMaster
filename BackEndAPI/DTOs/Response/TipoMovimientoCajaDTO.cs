namespace BackEndAPI.DTOs.Response
{
    public class TipoMovimientoCajaDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public bool EsIngreso { get; set; }
        public bool EsEfectivo { get; set; }
        public string Entorno { get; set; }
    }
}

