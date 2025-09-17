using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IEmpresasRepository
    {
        Task<Empresa> GetEmpresaByIdAsync(Guid id);
        Task<IEnumerable<Empresa>> GetAllEmpresasAsync();
        Task AddEmpresaAsync(Empresa empresa);
        Task UpdateEmpresaAsync(Empresa empresa);
        Task DeleteEmpresaAsync(Guid id);
    }
}
