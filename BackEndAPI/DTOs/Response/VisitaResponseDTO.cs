namespace BackEndAPI.DTOs.Response
{
    public class VisitaResponseDTO
    {
        public Guid Id { get; set; }
        public DateTime FechaHora { get; set; }
        public string Estado { get; set; }
        /// <summary>Total de la visita.</summary>
        public decimal Total { get; set; }
        public List<ItemDTO> ProductosConsumidos { get; set; } = new List<ItemDTO>();

        /// <summary>Incluido en respuestas de visitas activas para que el frontend pueda mostrar mesa.</summary>
        public Guid? IdMesa { get; set; }
        /// <summary>Nombre de la mesa (ej. "Mesa 1"). Incluido en respuestas de visitas activas.</summary>
        public string? NumeroMesa { get; set; }
        /// <summary>Datos del mozo que atendió la mesa en esta visita (id, codigoDeServicio, nombres, apellido).</summary>
        public MozoEnVisitaDTO? Mozo { get; set; }
        /// <summary>Origen de la visita (ej. Mesa, Delivery, TakeAway).</summary>
        public string? Origen { get; set; }
    }
}
