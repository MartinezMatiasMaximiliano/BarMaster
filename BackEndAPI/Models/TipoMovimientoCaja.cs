namespace BackEndAPI.Models
{
    public class TipoMovimientoCaja
    {
        public int Id { get; set; } 
        public string Nombre { get; set; } = string.Empty;
        public bool EsIngreso { get; set; } 
        public bool EsEfectivo { get; set; }
        public string Entorno { get; set; } = string.Empty;
    }
}
