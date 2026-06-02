namespace BackEndAPI.ARCA.Clases
{
    //clase para representar la solicitud de autenticación de ARCA
    public class FEAuthRequest
    {
        public string Token { get; set; } = default!;
        public string Sign { get; set; } = default!;
        public long Cuit { get; set; }
    }
}
