namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ModificarPlanoDTO
    {
        public Guid IdPlano { get; set; }
        public string? Nombre { get; set; }
        public string? Detalles { get; set; }
    }
}
