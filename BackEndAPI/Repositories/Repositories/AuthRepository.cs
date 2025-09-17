using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ApiDbContext _context;
        public AuthRepository(ApiDbContext context)
        {
            _context = context;
        }


        public Task<string> Login(string telefono, string password)
        {
            throw new NotImplementedException();
        }

        public async Task<string> LoginSucursal(string password)
        {
            throw new NotImplementedException();
            //var sucursal = await _context.Sucursales.FirstOrDefaultAsync(s => s.Password == password);

            //if (usuario == null)

            //    {
            //        return Unauthorized("Usuario o contraseña incorrecto"); 
            //    }

            //    if (!_userService.VerificarUsuario(usuario, loginDto.Contrasena))
            //    {
            //        return Unauthorized("Usuario o contrasena incorrecta");
            //    }

            //    if (usuario.Rol.Id != 1 && usuario.Rol.Id != 3) // Temporal, es solo para testear el nuevo usuario "Cajero" que tiene ID 3 en mi db local
            //    {
            //        return Unauthorized("El usuario no es admin");
            //    }

            //    var token = _userService.CrearJWT(loginDto.Dni,usuario.Id,usuario.Nombres,usuario.Apellido,usuario.Rol.Nombre);
            //    return Ok(token);
        }

        public Task<string> Register(string telefono, string password, int rolId, Guid? idSucursal = null)
        {
            throw new NotImplementedException();
        }

        public Task<bool> SucursalExists()
        {
            throw new NotImplementedException();
        }

        public Task<bool> UserExists(string telefono)
        {
            throw new NotImplementedException();
        }
    }
}
