using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IEmpresasRepository
    {
        Task<IEnumerable<Empresa>> GetAllEmpresasAsync();
        Task<Empresa?> GetEmpresaByIdAsync(Guid id);
        Task<Empresa?> GetEmpresaByNombreAsync(string nombre);
        Task AddEmpresaAsync(Empresa empresa);
        Task UpdateEmpresaAsync(Empresa empresa);
        Task DeleteEmpresaAsync(Guid id);
    }
}
