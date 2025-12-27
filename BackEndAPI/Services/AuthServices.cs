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
    private readonly ITenantServices _tenantServices;
    private readonly PasswordService _passwordService;
    private readonly JWTServices _jwtServices;
    public AuthServices(IEmpresasRepository empresasRepository, ITenantServices tenantProvider, PasswordService passwordService, JWTServices jwtServices)
    {
        _empresasRepository = empresasRepository;
        _passwordService = passwordService;
        _jwtServices = jwtServices;
        _tenantServices = tenantProvider;
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
        string Username;
        string? nombreSucursal = null;

        var atIndex = loginDTO.Username.IndexOf('@');

        if (atIndex >= 0)
        {
            Username = loginDTO.Username.Substring(0, atIndex);
            nombreSucursal = loginDTO.Username.Substring(atIndex + 1);
        }
        else
        {
            Username = loginDTO.Username;
        }

        var tenant = await _tenantServices.BuscarTenantPorNombreEmpresa(Username);
        if (tenant == null)
            throw new Exception("usuario no encontrado");

        var empresa = await _empresasRepository.GetEmpresaByUsername(Username);
        if (empresa == null)
            throw new Exception("usuario no encontrado");

        // LOGIN EMPRESA
        if (string.IsNullOrEmpty(nombreSucursal))
        {
            if (!_passwordService.VerificarPasswordHash(loginDTO.Password,empresa.PasswordHash,empresa.PasswordSalt)) throw new Exception("usuario no encontrado");

            return _jwtServices.CrearJWTEmpresa(empresa);
        }

        // LOGIN SUCURSAL
        var sucursal = empresa.Sucursales.FirstOrDefault(s =>s.Nombre.Equals(nombreSucursal, StringComparison.OrdinalIgnoreCase));

        if (sucursal == null) throw new Exception("usuario no encontrado");

        if (!_passwordService.VerificarPasswordHash(loginDTO.Password,sucursal.PasswordHash,sucursal.PasswordSalt)) throw new Exception("usuario no encontrado");

        return _jwtServices.CrearJWTSucursal(sucursal);
    }

}

