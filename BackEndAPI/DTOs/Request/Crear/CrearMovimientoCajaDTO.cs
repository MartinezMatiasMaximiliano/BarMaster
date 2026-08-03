namespace BackEndAPI.DTOs.Request.Crear
{
    public class CrearMovimientoCajaDTO
    {
        public int IdTipoMovimientoCaja { get; set; }
        public Guid IdCaja { get; set; }
        public decimal Monto { get; set; }
        public string? Descripcion { get; set; }
    }
}

