namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ModificarMesaDTO
    {
        public Guid Id { get; set; }
        public string? Nombre { get; set; }
        public int? Capacidad { get; set; } 
        public int? x { get; set; }
        public int? y { get; set; }
        public int? w { get; set; }
        public int? h { get; set; }
    }
}
