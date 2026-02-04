namespace BackEndAPI.DTOs.Response
{
    public class VisitaResponseDTO
    {
        public Guid Id { get; set; }
        public DateTime FechaHora { get; set; }
        public string Estado { get; set; }
        
        public List<ItemDTO> ProductosConsumidos { get; set; } = new List<ItemDTO>();

        /// <summary>Incluido en respuestas de visitas activas para que el frontend pueda mostrar mesa.</summary>
        public Guid? IdMesa { get; set; }
        /// <summary>Nombre de la mesa (ej. "Mesa 1"). Incluido en respuestas de visitas activas.</summary>
        public string? NumeroMesa { get; set; }
    }
}
