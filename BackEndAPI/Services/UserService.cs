using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services.Global;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BackEndAPI.Services
{
    public class UserService
    {
        
        private readonly IConfiguration _config;
        private readonly SymmetricSecurityKey _key;

        public UserService(IConfiguration config)
        {
            _config = config;
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:SigningKey"]));
        }

        public bool VerificarUsuario(Persona usuario, string contrasena)
        {
            throw new NotImplementedException();
        }

        public JWTToken CrearJWT(string Dni, int id, string Nombres, string Apellido, string Rol)
        {
            int hours_expire = 1;
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, Dni),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:SigningKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "BackendAPI",
                audience: "FrontendCliente",
                claims: claims,
                expires: DateTime.Now.AddHours(hours_expire),
                signingCredentials: creds);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return new JWTToken
            {
                //Access_token = tokenString,
                //Token_type = "bearer",
                //Dni = Dni,
                //Nombres = Nombres,
                //Apellido = Apellido,
                ////Id = id,
                //Rol = Rol,
                //expires = token.ValidTo.ToString(),
                //Expires_in = 3600 * hours_expire
            };
        }
    }
}
