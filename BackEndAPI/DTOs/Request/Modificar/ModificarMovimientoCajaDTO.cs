namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ModificarMovimientoCajaDTO
    {
        public int? IdTipoMovimientoCaja { get; set; }
        public Guid? IdCaja { get; set; }
        public decimal? Monto { get; set; }
        public string? Descripcion { get; set; }
    }
}

