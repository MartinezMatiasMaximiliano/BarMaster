namespace BackEndAPI.DTOs.Request.Crear
{
    public class CrearMovimientoCajaDTO
    {
        public int IdTipoMovimientoCaja { get; set; }
        public decimal MontoAbonado { get; set; }
        public decimal MontoTotal { get; set; }
        public string? Descripcion { get; set; }
    }
}

