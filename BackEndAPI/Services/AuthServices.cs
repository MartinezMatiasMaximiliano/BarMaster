using BackEndAPI.Data;
using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Runtime.CompilerServices;

namespace BackEndAPI.Services;

public class AuthServices : IAuthServices
{
    private readonly ITenantServices _tenantServices;
    private readonly IEmpresasRepository _empresasRepository;
    private readonly IPersonasRepository _personasRepository;
    private readonly PasswordService _passwordService;
    private readonly JWTServices _jwtServices;
    public AuthServices(ITenantServices tenantProvider, IEmpresasRepository empresasRepository, IPersonasRepository personasRepository, PasswordService passwordService, JWTServices jwtServices)
    {
        _tenantServices = tenantProvider;
        _empresasRepository = empresasRepository;
        _personasRepository = personasRepository;
        _passwordService = passwordService;
        _jwtServices = jwtServices;
    }



    public async Task<JWTToken> Authenticate(LoginDTO loginDTO)
    {
        string EmpresaUsername;
        string? SucursalUsername = null;

        var atIndex = loginDTO.Username.IndexOf('@');

        if (atIndex >= 0)
        {
            EmpresaUsername = loginDTO.Username.Substring(0, atIndex);
            SucursalUsername = loginDTO.Username.Substring(atIndex + 1);
        }
        else
        {
            EmpresaUsername = loginDTO.Username;
        }

        var tenant = await _tenantServices.BuscarTenantPorNombreEmpresa(EmpresaUsername);
        if (tenant == null)
            throw new Exception("usuario no encontrado");

        var empresa = await _empresasRepository.GetEmpresaByUsername(EmpresaUsername);
        if (empresa == null)
            throw new Exception("usuario no encontrado");

        // LOGIN EMPRESA
        if (string.IsNullOrEmpty(SucursalUsername))
        {
            if (!_passwordService.VerificarPasswordHash(loginDTO.Password, empresa.PasswordHash, empresa.PasswordSalt)) throw new Exception("usuario no encontrado");

            return _jwtServices.CrearJWTEmpresa(empresa);
        }

        // LOGIN SUCURSAL
        var sucursal = empresa.Sucursales.FirstOrDefault(s => s.Username == SucursalUsername);

        if (sucursal == null) throw new Exception("usuario no encontrado");

        if (!_passwordService.VerificarPasswordHash(loginDTO.Password, sucursal.PasswordHash, sucursal.PasswordSalt)) throw new Exception("usuario no encontrado");

        return _jwtServices.CrearJWTSucursal(sucursal);
    }

    public async Task<JWTToken> AuthenticatePersona(LoginDTO request)
    {

        var persona = await _personasRepository.GetPersonaPorDni(request.Username);
        if (persona == null) throw new Exception("Persona no encontrada");

        var PasswordValido = _passwordService.VerificarPasswordHash(request.Password, persona.PasswordHash, persona.PasswordSalt);

        if (!PasswordValido) throw new Exception("Contraseña incorrecta");
        var token = _jwtServices.CrearJWTPersona(persona);
        return token;

    }

}

