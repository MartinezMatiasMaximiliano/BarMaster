using BackEndAPI.Controllers;
using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class EmpresasServices : IEmpresasServices
    {
        private readonly IEmpresasRepository _empresasRepository;
        public EmpresasServices(IEmpresasRepository empresasRepository)
        {
            _empresasRepository = empresasRepository;
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
            };
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