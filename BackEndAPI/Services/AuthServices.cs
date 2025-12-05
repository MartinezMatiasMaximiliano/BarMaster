using BackEndAPI.Data;
using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Services;

public class AuthServices : IAuthServices
{
    private readonly IEmpresasRepository _empresasRepository;
    private readonly PasswordService _passwordService;
    private readonly JWTServices _jwtServices;
    private readonly ITenantProvider _tenantProvider;
    public AuthServices(IEmpresasRepository empresasRepository, PasswordService passwordService, JWTServices jwtServices, ITenantProvider tenantProvider)
    {
        _empresasRepository = empresasRepository;
        _passwordService = passwordService;
        _jwtServices = jwtServices;
        _tenantProvider = tenantProvider;
    }

    public async Task<JWTToken> LoginSucursal(string username, string password)
    {
        //var busqueda = await _sucursalRepository.GetSucursalByUsername(username);

        //if (busqueda == null) throw new Exception("Sucursal no encontrada");

        //var PasswordValido = _passwordService.VerificarPasswordHash(password, busqueda.PasswordHash, busqueda.PasswordSalt);

        //if (!PasswordValido) throw new Exception("Contraseña incorrecta");

        //var token = _jwtServices.CrearJWTSucursal(busqueda);
        //return token;
        return null;
    }

    public async Task<JWTToken> Authenticate(LoginDTO loginDTO)
    {
        var UsernameSplit = loginDTO.Username.Split("@");
        string NombreEmpresa = UsernameSplit[0];
        string NombreSucursal = UsernameSplit[1];

        var tenant = await _tenantProvider.GetTenant(NombreEmpresa);

        if (tenant == null)
        {
            //falla en busqueda por nombre de empresa
            throw new Exception();
        }

        var empresa = await _empresasRepository.GetEmpresaByNombre(NombreEmpresa);

        if (NombreSucursal == "empresa")
        {
            var password = _passwordService.VerificarPasswordHash(loginDTO.Password, empresa.PasswordHash, empresa.PasswordSalt);

        }
        else
        {

        }


        var stop = "";

        return null;
    }

}

