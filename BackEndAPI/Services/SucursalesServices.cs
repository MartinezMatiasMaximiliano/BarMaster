using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

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

        public async Task<Sucursal?> CrearSucursal(CrearSucursalDTO nuevaSucursal,Guid IdEmpresa)
        {
            var busqueda = await _sucursalesRepository.GetSucursalByUsername(nuevaSucursal.Nombre);

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
                IdEmpresa = IdEmpresa
                //IdEncargado = null

            };
            sucursal.EstablecerContrasena(passwordHash, passwordSalt);

            var creadaSucursal = await _sucursalesRepository.CrearSucursal(sucursal);
            return creadaSucursal;
        }
        public async Task<Sucursal?> BuscarSucursalPorId(Guid IdSucursal)
        {
            var sucursal = await _sucursalesRepository.GetSucursalById(IdSucursal);

            if (sucursal == null)
            {
                throw new Exception("Sucursal no encontrada");
            }
            return sucursal;
        }

    }
}
