namespace BackEndAPI.DTOs.Request.Modificar
{
    public class AbrirMesaDTO
    {
        public Guid IdMesa { get; set; }
        public string CodigoServicioMozo { get; set; }
        public bool Abrir { get; set; }
    }
}
