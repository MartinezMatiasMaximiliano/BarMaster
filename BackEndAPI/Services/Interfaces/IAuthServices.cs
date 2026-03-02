using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;
using System.Security.Claims;

namespace BackEndAPI.Services.Interfaces
{
    public interface IAuthServices
    {
        Task<JWTToken> Authenticate(LoginDTO loginDTO);
        Task<JWTToken> AuthenticatePersona(LoginDTO loginDTO);
        Task CambiarContraseña(CambiarContraseñaDTO request, ClaimsPrincipal user);
    }
}
