namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ModificarMenuDTO
    {
        public Guid IdMenu { get; set; }
        public string? Nombre { get; set; }
        public bool? Activo { get; set; }
    }
}
