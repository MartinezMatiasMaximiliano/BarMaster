namespace BackEndAPI.DTOs.Response
{
    public class JWTToken
    {
        public string Access_token { get; set; } = string.Empty;
        public string Token_type {  get; set; } = string.Empty;
        public string Dni {  get; set; } = string.Empty;
        public string Nombres { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public Guid Id { get; set; }
        public string Rol {  get; set; } = string.Empty;
        public int Expires_in { get; set; } = -1;
        public string expires {  get; set; } = string.Empty;
    }

    public class JWTTokenSucursal
    {
        public string Access_token { get; set; } = string.Empty;
        public string Token_type { get; set; } = string.Empty;
        public Guid Id { get; set; } 
        public string Direccion { get; set; } = string.Empty;
        public Guid IdEmpresa { get; set; } 
        public int Expires_in { get; set; } = -1;
        public string expires { get; set; } = string.Empty;
    }
}
