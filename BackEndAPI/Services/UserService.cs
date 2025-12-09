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
        private readonly PasswordService _passwordService;
        private readonly IConfiguration _config;
        private readonly SymmetricSecurityKey _key;

        public UserService(IConfiguration config)
        {
            _passwordService = new PasswordService();
            _config = config;
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:SigningKey"]));
        }

        public Persona CrearUsuario(CrearPersonaDTO DTO)
        {
            var usuario = new Persona
            {
                Nombres = DTO.Nombres,
                Apellido = DTO.Apellido,
                Dni = DTO.Dni,
                Direccion = DTO.Direccion,
                Telefono = DTO.Telefono,
                Activo = DTO.Activo,
            };
            _passwordService.CrearPasswordHash(DTO.Dni, out byte[] hashContrasena, out byte[] saltContrasena); // Genera hash y salt

            usuario.EstablecerContrasena(hashContrasena, saltContrasena);

            return usuario;
        }

        public bool VerificarUsuario(Persona usuario, string contrasena)
        {
            return _passwordService.VerificarPasswordHash(contrasena, usuario.PasswordHash, usuario.PasswordSalt);
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
