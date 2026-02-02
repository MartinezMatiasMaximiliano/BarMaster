namespace BackEndAPI.DTOs.Response
{
    /// <summary>Visita incluida dentro de MesaDTO (sin IdMesa por redundancia).</summary>
    public class VisitaEnMesaDTO
    {
        public Guid Id { get; set; }
        public Guid IdCaja { get; set; }
        public Guid IdMozo { get; set; }
        public DateTime FechaHora { get; set; }
        public string Estado { get; set; } = string.Empty;
    }
}
