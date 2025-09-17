using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IEmpresasServices
    {
        Task<Empresa> GetEmpresaByIdAsync(Guid id);
        Task<IEnumerable<Empresa>> GetAllEmpresasAsync();
        Task<CrearEmpresaResponseDTO> AddEmpresaAsync(CrearEmpresaDTO empresa);
        Task UpdateEmpresaAsync(Empresa empresa);
        Task DeleteEmpresaAsync(Guid id);
    }
}
