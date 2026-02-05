namespace BackEndAPI.DTOs.Request.Modificar
{
    public class PagarProductosDTO
    {
        public Guid IdVisita { get; set; }
        public ICollection<int> IdsProductos { get; set; } = new List<int>();
    }
}
