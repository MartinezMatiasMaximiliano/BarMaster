namespace BackEndAPI.Models
{
    public class Auditorias
    {
        public int Id { get; set; }
        public string Tabla { get; set; }
        public string PK { get; set; }
        public string Anterior { get; set; }
        public string Posterior { get; set; }
        public string Accion { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
