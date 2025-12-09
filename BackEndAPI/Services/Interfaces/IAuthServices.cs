using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;

namespace BackEndAPI.Services.Interfaces
{
    public interface IAuthServices
    {
        Task<JWTToken> LoginSucursal(string username,string password);
    }
}
