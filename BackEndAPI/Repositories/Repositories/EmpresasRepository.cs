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
        public async Task<IEnumerable<Empresa>> GetAllEmpresasAsync()
        {
            return await _context.Empresas.ToListAsync();
        }
        public async Task<Empresa?> GetEmpresaByIdAsync(Guid id)
        {
            return await _context.Empresas.FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<Empresa?> GetEmpresaByNombreAsync(string nombre)
        {
            return await _context.Empresas.FirstOrDefaultAsync(e => e.Nombre.ToLower() == nombre.ToLower());
        }
        public async Task AddEmpresaAsync(Empresa empresa)
        {
            await _context.Empresas.AddAsync(empresa);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateEmpresaAsync(Empresa empresa)
        {
            _context.Empresas.Update(empresa);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteEmpresaAsync(Guid Id)
        {
            var empresa = new Empresa { Id = Id };  
            _context.Empresas.Attach(empresa);
            _context.Empresas.Remove(empresa);
            await _context.SaveChangesAsync();
        }
    }
}