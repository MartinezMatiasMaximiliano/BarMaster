namespace BackEndAPI.DTOs.Response
{
    public class MozoValidadoDTO
    {
        public Guid Id { get; set; }
        public string Nombres { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public int PersonajeId { get; set; }
    }
}
