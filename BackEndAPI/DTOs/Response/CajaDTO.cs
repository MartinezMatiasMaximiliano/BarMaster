namespace BackEndAPI.DTOs.Response
{
    public class CajaDTO
    {
        public Guid Id { get; set; }
        public Guid IdSucursal { get; set; }
        public DateTime FechaApertura { get; set; }
        public DateTime? FechaCierre { get; set; }
        public decimal MontoApertura { get; set; }
        public decimal MontoActual { get; set; }
        public decimal? MontoCierre { get; set; }
        public decimal? Diferencia { get; set; }
    }
}

