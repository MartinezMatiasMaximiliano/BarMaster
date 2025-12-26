namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ModificarEmpresaDTO
    {
        public string? Nombre { get; set; }
        public string? Telefono { get; set; }
        public string? Email { get; set; }
        public bool? Activo { get; set; } = false;
    }
}
