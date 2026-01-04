namespace BackEndAPI.DTOs.Request.Crear
{
    public class CrearTipoMovimientoCajaDTO
    {
        public string Nombre { get; set; } = string.Empty;
        public bool EsIngreso { get; set; }
        public bool EsEfectivo { get; set; }
    }
}

