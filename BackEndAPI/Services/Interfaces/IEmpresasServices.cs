using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IEmpresasServices
    {
        Task<IEnumerable<Empresa>> GetAllEmpresasAsync();
        Task<Empresa?> GetEmpresaByIdAsync(Guid id);
        Task<Empresa?> GetEmpresaByNombreAsync(string nombre);
        Task<Empresa> AddEmpresaAsync(CrearEmpresaDTO empresa);
        Task<bool> UpdateEmpresaAsync(Guid id,ActualizarEmpresaDTO empresa);
        Task DeleteEmpresaAsync(Guid id);
    }
}
