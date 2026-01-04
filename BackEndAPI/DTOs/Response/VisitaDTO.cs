namespace BackEndAPI.DTOs.Response
{
    public class VisitaDTO
    {
        public Guid Id { get; set; }
        public Guid IdCaja { get; set; }
        public Guid IdMesa { get; set; }
        public Guid IdMozo { get; set; }
        public DateTime FechaHora { get; set; }
        public string Estado { get; set; }    
    }
}
