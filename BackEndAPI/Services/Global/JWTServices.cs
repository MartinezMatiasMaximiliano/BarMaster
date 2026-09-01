using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BackEndAPI.Tenancy.Services;

namespace BackEndAPI.Services.Global
{
    public class JWTServices
    {
        private readonly IConfiguration _config;
        private readonly SymmetricSecurityKey _key;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public JWTServices(IConfiguration config, IHttpContextAccessor httpContextAccessor)
        {
            _config = config;
            _httpContextAccessor = httpContextAccessor;
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _config["JWT:SigningKey"] ?? throw new InvalidOperationException("JWT SigningKey not configured")));
        }

        public JWTToken CrearJWTSucursal(Sucursal request)
        {
            int hours_expire = 1;
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), //jti = json token id
                new Claim("IdEmpresa", request.IdEmpresa.ToString()),
                new Claim("IdSucursal", request.Id.ToString()),
                new Claim("TenantId", GetTenantId()),
                new Claim("TipoAuth","sucursal")
            };

            var key = _key;
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["JWT:Issuer"],
                audience: _config["JWT:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(hours_expire),
                signingCredentials: creds);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return new JWTToken
            {
                Access_token = tokenString,
                Token_type = "bearer",
                Auth_type = "sucursal",
                expires = token.ValidTo.ToString(),
                Expires_in = 3600 * hours_expire
            };
        }

        public JWTToken CrearJWTEmpresa(Empresa request)
        {
            int hours_expire = 1;
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), //jti = json token id
                new Claim("IdEmpresa", request.Id.ToString()),
                new Claim("TenantId", GetTenantId()),
                new Claim("TipoAuth","empresa")
            };

            var key = _key;
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["JWT:Issuer"],
                audience: _config["JWT:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(hours_expire),
                signingCredentials: creds);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return new JWTToken
            {
                Access_token = tokenString,
                Token_type = "bearer",
                Auth_type = "empresa",
                expires = token.ValidTo.ToString(),
                Expires_in = 3600 * hours_expire
            };
        }

        public JWTToken CrearJWTPersona(Persona persona)
        {
            int hours_expire = 1;
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), //jti = json token id
                new Claim("IdPersona", persona.Id.ToString()),
                new Claim("IdEmpresa", persona.IdEmpresa.ToString()),
                new Claim("IdSucursal", persona.IdSucursal?.ToString() ?? string.Empty),
                new Claim("TenantId", GetTenantId()),
                new Claim("RequestedBy",$"{persona.Apellido},{persona.Nombres}"),
                new Claim("RequestedRole", persona.Rol?.Nombre ?? string.Empty),
                new Claim("TipoAuth","admin"),
            };

            var key = _key;
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["JWT:Issuer"],
                audience: _config["JWT:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(hours_expire),
                signingCredentials: creds);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return new JWTToken
            {
                Access_token = tokenString,
                Token_type = "bearer",
                Auth_type = "admin",
                PersonajeId = persona.PersonajeId,
                expires = token.ValidTo.ToString(),
                Expires_in = 3600 * hours_expire
            };
        }

        private string GetTenantId()
        {
            var value = _httpContextAccessor.HttpContext?.Request.Headers["X-Tenant-ID"].ToString();
            if (string.IsNullOrWhiteSpace(value))
                throw new InvalidOperationException("X-Tenant-ID es obligatorio para emitir un JWT.");
            return TenantIdentifier.Normalize(value);
        }
    }
}
