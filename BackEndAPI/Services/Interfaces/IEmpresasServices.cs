using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Models;

namespace BackEndAPI.Services.Interfaces
{
    public interface IEmpresasServices
    {
        Task<IEnumerable<Empresa>> GetAllEmpresas();
        Task<Empresa?> GetEmpresaById(Guid id);
        Task<Empresa?> GetEmpresaByNombre(string nombre);
        Task<Empresa> AddEmpresa(CrearEmpresaDTO empresa);
        Task<bool> ModificarEmpresa(Guid id,ModificarEmpresaDTO empresa);
        Task DeleteEmpresa(Guid id);
    }
}
