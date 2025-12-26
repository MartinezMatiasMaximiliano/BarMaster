using BackEndAPI.Controllers;
using BackEndAPI.Data;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Services
{
    public class EmpresasServices : IEmpresasServices
    {
        private readonly IEmpresasRepository _empresasRepository;
        private readonly ITenantProvisioner _tenantProvisioner;
        private readonly ITenantProvider _tenantProvider;
        private readonly PasswordService _passwordService;
        public EmpresasServices(IEmpresasRepository empresasRepository,ITenantProvisioner tenantProvisioner , ITenantProvider tenantProvider,PasswordService passwordService)
        {
            _empresasRepository = empresasRepository;
            _tenantProvisioner = tenantProvisioner;
            _tenantProvider = tenantProvider;
            _passwordService = passwordService;
        }
        public async Task<IEnumerable<Empresa>> GetAllEmpresas()
        {
            IEnumerable<Empresa> result = await _empresasRepository.GetAllEmpresas();
            return result;
        }
        public async Task<Empresa?> GetEmpresaById(Guid id)
        {
            var result = await _empresasRepository.GetEmpresaById(id);
            return result;
        }
        public async Task<Empresa?> GetEmpresaByNombre(string nombre)
        {
            return await _empresasRepository.GetEmpresaByNombre(nombre);
            
        }
        public async Task<Empresa> AddEmpresa(CrearEmpresaDTO request)
        {
            var result = await _tenantProvider.GetTenant(request.Nombre);

            if (result != null)
            {
                throw new Exception("Ya existe una empresa con el nombre solicitado.");
            }

            Empresa empresa = new()
            {
                Nombre = request.Nombre,
                Telefonos = request.Telefonos,
                Emails = request.Emails,
                Activo = true,
                FechaInscripcion = DateTime.UtcNow,
                IdTipoSubscripcion = null,
                Username = $"{request.Nombre}",
            };
            _passwordService.CrearPasswordHash(request.Password, out byte[] hash, out byte[] salt);
            empresa.EstablecerContrasena(hash, salt);

            var tenantInfo = await _tenantProvisioner.ProvisionTenantAsync(empresa);
            return empresa;
        }
        public Task<bool> ModificarEmpresa(Guid id,ModificarEmpresaDTO request)
        {
                throw new KeyNotFoundException($"La empresa con ID {id} no fue encontrada.");
            //var result = await _repository.GetEmpresaByIdAsync(id);
            //if (result == null)
            //{
            //}

            
        }
        public async Task DeleteEmpresa(Guid id)
        {
            await _empresasRepository.DeleteEmpresa(id);

        }
    }
}