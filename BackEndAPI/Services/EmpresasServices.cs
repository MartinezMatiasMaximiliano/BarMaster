using BackEndAPI.Controllers;
using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class EmpresasServices : IEmpresasServices
    {
        private readonly IEmpresasRepository _empresasRepository;
        private readonly PasswordService _passwordService;
        public EmpresasServices(IEmpresasRepository empresasRepository,PasswordService passwordService)
        {
            _empresasRepository = empresasRepository;
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
            var result = await _empresasRepository.GetEmpresaByNombre(request.Nombre);

            if (result != null)
            {
                throw new Exception($"Ya existe una empresa con el nombre {request.Nombre}.");
            }

            Empresa empresa = new()
            {
                Nombre = request.Nombre,
                Telefonos = request.Telefonos,
                Emails = request.Emails,
                Activo = true,
                FechaInscripcion = DateTime.UtcNow,
                IdTipoSubscripcion = 1,
                Username = $"empresa@{request.Nombre}",
            };

            _passwordService.CrearPasswordHash(request.Password, out byte[] hash, out byte[] salt);
            empresa.EstablecerContrasena(hash, salt);


            await _empresasRepository.AddEmpresa(empresa);
            return empresa;
        }
        public Task<bool> UpdateEmpresa(Guid id,ActualizarEmpresaDTO request)
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