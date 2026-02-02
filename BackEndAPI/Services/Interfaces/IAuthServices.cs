using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;

namespace BackEndAPI.Services.Interfaces
{
    public interface IAuthServices
    {
        Task<JWTToken> Authenticate(LoginDTO loginDTO);
        Task<JWTToken> AuthenticatePersona(LoginDTO loginDTO);
    }
}
