namespace BackEndAPI.DTOs.Request.Crear
{
    public class CrearPagoDTO
    {
        public int IdTipoMovimiento { get; set; }
        public Guid IdVisita { get; set; }
        public decimal Monto { get; set; }
        public ICollection<int> ListaIdsProductos { get; set; } = new List<int>();

    }
}
