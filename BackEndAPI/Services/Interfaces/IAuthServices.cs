using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;
using Microsoft.EntityFrameworkCore.Storage.Json;

namespace BackEndAPI.Services.Interfaces
{
    public interface IAuthServices
    {
        Task<JWTToken> LoginSucursal(string username,string password);
        Task<JWTToken> Authenticate(LoginDTO loginDTO);
    }
}
