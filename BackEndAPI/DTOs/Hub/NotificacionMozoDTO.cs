namespace BackEndAPI.DTOs.Hub
{
    public class NotificacionMozoDTO
    {
        public string Fecha { get; set; } =null!;
        public int IdMesa { get; set; }
        public string? Mensaje { get; set; }


        // Función para calcular el tiempo desde que se creó la notificación
        
    }
}
