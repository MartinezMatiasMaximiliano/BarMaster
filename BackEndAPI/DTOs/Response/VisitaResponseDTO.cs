namespace BackEndAPI.DTOs.Response
{
    public class VisitaResponseDTO
    {
        public Guid Id { get; set; }
        public DateTime FechaHora { get; set; }
        public string Estado { get; set; }
        
        public List<ItemDTO> ProductosConsumidos { get; set; } = new List<ItemDTO>();
    }
}
