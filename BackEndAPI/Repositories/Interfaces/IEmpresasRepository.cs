using BackEndAPI.Models;
using BackEndAPI.Tenancy.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IEmpresasRepository
    {
        Task<IEnumerable<Empresa>> GetAllEmpresas();
        Task<Empresa?> GetEmpresaById(Guid id);
        Task<Empresa?> GetEmpresaByUsername(string nombre);
        Task<Empresa?> GetEmpresaConDatosResumen(Guid id);
        Task<Empresa> AddEmpresa(Empresa empresa, Tenant tenant);
        Task UpdateEmpresa(Empresa empresa);
        Task DeleteEmpresa(Guid id);
    }
}
