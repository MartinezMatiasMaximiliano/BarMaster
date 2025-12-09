using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services;

public class AuthServices : IAuthServices
{
    private readonly ISucursalRepository _sucursalRepository;
    private readonly PasswordService _passwordService;
    private readonly JWTServices _jwtServices;
    public AuthServices(IAuthRepository authRepository,ISucursalRepository sucursalRepository,PasswordService passwordService ,JWTServices jwtServices)
    {
        _sucursalRepository = sucursalRepository;
        _passwordService = passwordService;
        _jwtServices = jwtServices;
    }

    public async Task<JWTToken> LoginSucursal(string username,string password)
    {
        var busqueda = await _sucursalRepository.GetSucursalByUsername(username);

        if (busqueda == null) throw new Exception("Sucursal no encontrada");
        
        var PasswordValido = _passwordService.VerificarPasswordHash(password, busqueda.PasswordHash, busqueda.PasswordSalt);

        if (!PasswordValido) throw new Exception("Contraseña incorrecta"); 

        var token = _jwtServices.CrearJWTSucursal(busqueda);
        return token;
    }
}

