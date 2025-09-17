using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services;

public class AuthServices : IAuthServices
{
    private readonly IAuthRepository _authRepository;
    private readonly JWTServices _jwtServices;
    public AuthServices(IAuthRepository authRepository, JWTServices jwtServices)
    {
        _authRepository = authRepository;
        _jwtServices = jwtServices;
    }

    public async Task<JWTTokenSucursal> LoginSucursal(string password)
    {
        var result = await _authRepository.LoginSucursal(password);

        if (result == null)
        {
            return null;
        }
        var token = _jwtServices.CrearJWTSucursal(result);
        return token;
    }
}

