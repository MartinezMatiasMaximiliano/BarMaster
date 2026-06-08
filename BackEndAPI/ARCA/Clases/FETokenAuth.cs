using System.Security.Policy;

namespace BackEndAPI.ARCA.Clases
{
    public class FETokenAuth
    {
        public int Id { get; set; }
        public string Token { get; set; } = default!;
        public string Sign { get; set; } = default!;
        public DateTime ExpirationTime { get; set; }
        public bool IsValid => DateTime.UtcNow < ExpirationTime;
        public bool IsExpired => DateTime.UtcNow >= ExpirationTime;
    }

}
