namespace BackEndAPI.DTOs.Response
{
    public class PlanosDTO
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Detalles { get; set; } = string.Empty;
        public Guid IdSucursal { get; set; }

        public ICollection<MesaDTO> Mesas { get; set; } = new List<MesaDTO>();  
    }
}
