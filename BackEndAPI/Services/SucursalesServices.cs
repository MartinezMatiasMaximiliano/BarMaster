using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using QuestPDF.Elements;

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

        public async Task<Sucursal?> CrearSucursal(CrearSucursalDTO nuevaSucursal, Guid IdEmpresa)
        {
            var busqueda = await _sucursalesRepository.GetSucursalByUsername(nuevaSucursal.Nombre);

            if (busqueda != null) throw new Exception("Sucursal ya existe");
           
            _passwordService.CrearPasswordHash(nuevaSucursal.Password, out byte[] passwordHash, out byte[] passwordSalt);

            Sucursal sucursal = new Sucursal
            {
                Id = Guid.NewGuid(),
                IdEmpresa = IdEmpresa,
                Nombre = nuevaSucursal.Nombre,
                Direccion = nuevaSucursal.Direccion,
                Telefono = nuevaSucursal.Telefono,
                Username = nuevaSucursal.Username.ToLower().Replace(" ", "")
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

        public async Task<Sucursal?> ActualizarSucursal(Guid IdSucursal, ModificarSucursalDTO actualizarSucursal)
        {
            var sucursal = await _sucursalesRepository.GetSucursalById(IdSucursal);
            if (sucursal == null) throw new Exception("Sucursal no encontrada");

            sucursal.Nombre = actualizarSucursal.Nombre == null ? sucursal.Nombre : actualizarSucursal.Nombre;
            sucursal.Direccion = actualizarSucursal.Direccion == null ? sucursal.Direccion : actualizarSucursal.Direccion;
            sucursal.Telefono = actualizarSucursal.Telefono == null ? sucursal.Telefono : actualizarSucursal.Telefono;
            sucursal.Username = actualizarSucursal.Username == null ? sucursal.Username : actualizarSucursal.Username;
            var sucursalActualizada = await _sucursalesRepository.ActualizarSucursal(sucursal);
            return sucursalActualizada;
        }
    }
}
