using BackEndAPI.DTOs.Response;

namespace BackEndAPI.Services.Interfaces
{
    public interface IAuthServices
    {
        //Task<string> Login(string telefono, string password);
        //Task<string> Register(string telefono, string password, int rolId, Guid? idSucursal = null);
        //Task<bool> UserExists(string telefono);
        Task<JWTTokenSucursal> LoginSucursal(string password);
        //Task<bool> SucursalExists();
    }
}
