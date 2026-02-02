namespace BackEndAPI.DTOs.Response
{
    public class MesaDTO
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int Capacidad { get; set; }
        public string? CodigoParaPedir { get; set; }
        public float x { get; set; }
        public float y { get; set; }
        public float w { get; set; }
        public float h { get; set; }
        public PlanoDTO? Plano { get; set; }
        /// <summary>Visita asociada a la mesa si está abierta (Estado = Abierta). Sin IdMesa por redundancia.</summary>
        public VisitaEnMesaDTO? Visita { get; set; }
    }
}
