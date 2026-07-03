using BackEndAPI.DTOs.Query;
using BackEndAPI.Models;
using BackEndAPI.Tenancy.Models;

namespace BackEndAPI.Repositories.Interfaces
{
    public interface IEmpresasRepository
    {
        Task<IEnumerable<Empresa>> GetAllEmpresas();
        Task<Empresa?> GetEmpresaById(Guid id);
        Task<Empresa?> GetEmpresaByUsername(string nombre);
        Task<EmpresaResumenQueryDTO?> GetDatosResumenSucursales(Guid idEmpresa, DateTime desdeUtc, DateTime hastaUtc);
        Task<Empresa> AddEmpresa(Empresa empresa, Tenant tenant);
        Task UpdateEmpresa(Empresa empresa);
        Task DeleteEmpresa(Guid id);
    }
}
