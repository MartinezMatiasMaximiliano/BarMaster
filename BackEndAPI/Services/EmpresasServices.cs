using BackEndAPI.Controllers;
using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Services.Interfaces;

namespace BackEndAPI.Services
{
    public class EmpresasServices : IEmpresasServices
    {
        private readonly IEmpresasRepository _repository;
        public EmpresasServices(IEmpresasRepository repository)
        {
            _repository = repository;
        }
        public async Task<IEnumerable<Empresa>> GetAllEmpresasAsync()
        {
            IEnumerable<Empresa> result = await _repository.GetAllEmpresasAsync();
            return result;
        }
        public async Task<Empresa?> GetEmpresaByIdAsync(Guid id)
        {
            var result = await _repository.GetEmpresaByIdAsync(id);
            return result;
        }
        
        public async Task<Empresa?> GetEmpresaByNombreAsync(string nombre)
        {
            return await _repository.GetEmpresaByNombreAsync(nombre);
            
        }
        public async Task<Empresa> AddEmpresaAsync(CrearEmpresaDTO request)
        {
            Empresa empresa = new()
            {
                Nombre = request.Nombre,
                Telefono = request.Telefono,
                Email = request.Email,
            };
            await _repository.AddEmpresaAsync(empresa);
            return empresa;
        }
        public Task<bool> UpdateEmpresaAsync(Guid id,ActualizarEmpresaDTO request)
        {
                throw new KeyNotFoundException($"La empresa con ID {id} no fue encontrada.");
            //var result = await _repository.GetEmpresaByIdAsync(id);
            //if (result == null)
            //{
            //}

            
        }
        public async Task DeleteEmpresaAsync(Guid id)
        {
            await _repository.DeleteEmpresaAsync(id);

        }
    }
}