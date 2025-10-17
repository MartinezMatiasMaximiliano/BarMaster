using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BackEndAPI.Services
{
    public class JWTServices
    {

        private readonly PasswordService _passwordService;
        private readonly IConfiguration _config;
        private readonly SymmetricSecurityKey _key;

        public JWTServices(IConfiguration config)
        {
            _passwordService = new PasswordService();
            _config = config;
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:SigningKey"]));
        }

        public JWTTokenSucursal CrearJWTSucursal(Sucursal request)
        {
            int hours_expire = 1;
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), //jti = json token id
                new Claim("IdEmpresa", request.IdEmpresa.ToString()),
                new Claim("IdSucursal", request.Id.ToString())


            };

            var key = _key;
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "BackendAPI",
                audience: "FrontendCliente",
                claims: claims,
                expires: DateTime.Now.AddHours(hours_expire),
                signingCredentials: creds);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return new JWTTokenSucursal
            {
                Access_token = tokenString,
                Token_type = "bearer",
                Id = request.Id,
                IdEmpresa = request.IdEmpresa,
                Direccion = request.Direccion,
                expires = token.ValidTo.ToString(),
                Expires_in = 3600 * hours_expire
            };
        }
    }
}
