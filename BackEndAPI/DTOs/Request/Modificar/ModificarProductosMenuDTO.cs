namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ModificarProductosMenuDTO
    {
        public Guid IdMenu { get; set; }
        public List<Guid> IdsProductos { get; set; } = new List<Guid>();
        public string Accion { get; set; } = string.Empty; // "Agregar" o "Eliminar"
    }
}
