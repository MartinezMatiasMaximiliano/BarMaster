using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IEmpresasServices
    {
        Task<IEnumerable<Empresa>> GetAllEmpresas();
        Task<Empresa?> GetEmpresaById(Guid id);
        Task<Empresa?> GetEmpresaByNombre(string nombre);
        Task<Empresa> AddEmpresa(CrearEmpresaDTO empresa);
        Task<bool> UpdateEmpresa(Guid id,ActualizarEmpresaDTO empresa);
        Task DeleteEmpresa(Guid id);
    }
}
