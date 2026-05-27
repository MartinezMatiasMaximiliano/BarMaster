namespace BackEndAPI.ARCA.Clases
{
    public class ArcaAuthResponse
    {
        public string Token { get; set; } = default!;
        public string Sign { get; set; } = default!;
        public DateTime ExpirationTime { get; set; }
    }
}
