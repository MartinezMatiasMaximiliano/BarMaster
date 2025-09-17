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
        public async Task<CrearEmpresaResponseDTO> AddEmpresaAsync(CrearEmpresaDTO request)
        {

            Empresa empresa = new (){
                Nombre = request.Nombre,
                Telefono = request.Telefono,
                Email = request.Email,
            };
            await _repository.AddEmpresaAsync(empresa);

            CrearEmpresaResponseDTO response = new()
            {
                Id = empresa.Id,
                Nombre = empresa.Nombre,
                Telefono = empresa.Telefono,
                Email = empresa.Email,
                Activo = empresa.Activo,
                FechaInscripcion = empresa.FechaInscripcion

            };

            return response;
        }

        public Task DeleteEmpresaAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Empresa>> GetAllEmpresasAsync()
        {
            throw new NotImplementedException();
        }

        public Task<Empresa> GetEmpresaByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task UpdateEmpresaAsync(Empresa empresa)
        {
            throw new NotImplementedException();
        }
    }
}
