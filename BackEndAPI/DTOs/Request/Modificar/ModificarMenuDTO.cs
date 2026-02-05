namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ModificarMenuDTO
    {
        public Guid Id { get; set; }
        public string? Nombre { get; set; }
        public bool? Activo { get; set; }
    }
}
