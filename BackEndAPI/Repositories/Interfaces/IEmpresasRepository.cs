using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IEmpresasRepository
    {
        Task<IEnumerable<Empresa>> GetAllEmpresas();
        Task<Empresa?> GetEmpresaById(Guid id);
        Task<Empresa?> GetEmpresaByNombre(string nombre);
        Task<Empresa> AddEmpresa(Empresa empresa);
        Task UpdateEmpresa(Empresa empresa);
        Task DeleteEmpresa(Guid id);
    }
}
