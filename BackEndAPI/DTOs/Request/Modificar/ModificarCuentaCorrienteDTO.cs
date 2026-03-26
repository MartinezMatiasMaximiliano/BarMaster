namespace BackEndAPI.DTOs.Request.Modificar
{
    public class ModificarCuentaCorrienteDTO
    {
        public Guid IdCuenta { get; set; }
        public string? Nombre { get; set; }
        public string ? Telefono { get; set; }  
        public string? Domicilio { get; set; }
        public decimal? Descuento { get; set; }
    }
}
