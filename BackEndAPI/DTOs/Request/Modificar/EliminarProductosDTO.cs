namespace BackEndAPI.DTOs.Request.Modificar
{
    public class EliminarProductosDTO
    {
        public Guid IdVisita { get; set; }
        public ICollection<int> IdsProductos { get; set; } = new List<int>();
    }
}
