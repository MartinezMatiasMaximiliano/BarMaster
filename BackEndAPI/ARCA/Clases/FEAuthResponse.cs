namespace BackEndAPI.ARCA.Clases
{
    //clase para representar la respuesta de autenticación de ARCA
    public class FEAuthResponse
    {
        public string Token { get; set; } = default!;
        public string Sign { get; set; } = default!;
        public DateTime ExpirationTime { get; set; }
    }
}
