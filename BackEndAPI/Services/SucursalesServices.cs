using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class SucursalesServices : ISucursalesServices
    {
        private readonly ISucursalRepository _sucursalesRepository;
        private readonly PasswordService _passwordService;
        public SucursalesServices(ISucursalRepository sucursalesRepository, PasswordService passwordService)
        {
            _sucursalesRepository = sucursalesRepository;
            _passwordService = passwordService;
        }

        public async Task<Sucursal?> CrearSucursal(CrearSucursalDTO nuevaSucursal)
        {
            var busqueda = await _sucursalesRepository.GetSucursalByUsername(nuevaSucursal.Username);

            if (busqueda != null)
            {
                throw new Exception("Sucursal ya existe");
            }

            _passwordService.CrearPasswordHash(nuevaSucursal.Password, out byte[] passwordHash, out byte[] passwordSalt);

            Sucursal sucursal = new Sucursal
            {
                Id = Guid.NewGuid(),
                Nombre = nuevaSucursal.Nombre,
                Direccion = nuevaSucursal.Direccion,
                Telefono = nuevaSucursal.Telefono,
                Username = nuevaSucursal.Username,
                IdEmpresa = nuevaSucursal.IdEmpresa,
                IdEncargado = null

            };
            sucursal.EstablecerContrasena(passwordHash, passwordSalt);

            var creadaSucursal = await _sucursalesRepository.CrearSucursal(sucursal);
            return creadaSucursal;
        }
    }
}
