namespace BackEndAPI.ARCA.Clases
{
    public class FEAuthRequest
    {
        public string Token { get; set; } = default!;
        public string Sign { get; set; } = default!;
        public long Cuit { get; set; }
    }
}
