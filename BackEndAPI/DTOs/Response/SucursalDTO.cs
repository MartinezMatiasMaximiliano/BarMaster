namespace BackEndAPI.DTOs.Response
{
    public class SucursalDTO
    {
        public Guid Id { get; set; }
        public Guid IdEmpresa { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Direccion { get; set; }
        public string? Telefono { get; set; }
        public string Username { get; set; } = string.Empty;
        
        // Colecciones sin referencias circulares
        public List<MenuDTO>? Menus { get; set; }
        public List<PlanoDTO>? Planos { get; set; }
        public List<CajaDTO>? Cajas { get; set; }
    }

    public class MenuDTO
    {
        public Guid Id { get; set; }
        public Guid IdSucursal { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public bool Activo { get; set; }
    }
}
