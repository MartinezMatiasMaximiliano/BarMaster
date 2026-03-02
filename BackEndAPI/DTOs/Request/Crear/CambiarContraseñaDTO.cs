namespace BackEndAPI.DTOs.Request
{
    public class CambiarContraseñaDTO
    {
        public string ContraseñaActual { get; set; } = null!;
        public string ContraseñaNueva { get; set; } = null!;
        public string ConfirmacionContraseña { get; set; } = null!;
    }
}
