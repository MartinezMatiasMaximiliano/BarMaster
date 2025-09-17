using BackEndAPI.Data;
using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories.Repositories
{
    public class EmpresasRepository : IEmpresasRepository
    {
        private readonly ApiDbContext _context;
        public EmpresasRepository(ApiDbContext context)
        {
            _context = context;
        }

        public async Task AddEmpresaAsync(Empresa empresa)
        {
            await _context.Empresas.AddAsync(empresa);
            await _context.SaveChangesAsync();
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
