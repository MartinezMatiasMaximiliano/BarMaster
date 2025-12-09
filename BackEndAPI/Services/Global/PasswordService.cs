using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BackEndAPI.Services.Global
{
    //Esta clase contiene la logica para crear los hash y verificar contraseñas.
    public class PasswordService
    {
        //METODO PARA CREAR HASH Y SALT DE LA CONTRASEÑA
        public void CrearPasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key; // Genera una salt unica.
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password)); // Calcula el hash
            }
        }

        //METODO PARA VERIFICAR LA CONTRASEÑA INGRESADA
        public bool VerificarPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512(passwordSalt))
            {
                var hashGenerado = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
                return hashGenerado.SequenceEqual(passwordHash); // Compara el nuevo hash con el hash almacenado.
            }
        }

        
    }
}
