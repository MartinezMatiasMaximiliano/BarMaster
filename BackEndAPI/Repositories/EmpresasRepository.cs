using BackEndAPI.Data;
using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class EmpresasRepository : IEmpresasRepository
    {
        private readonly ApiDbContext _context;
        public EmpresasRepository(ApiDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Empresa>> GetAllEmpresas()
        {
            return await _context.Empresas
                .Include(e => e.Sucursales)
                .Include(e => e.Propietario)
                .ToListAsync();
        }
        public async Task<Empresa?> GetEmpresaById(Guid id)
        {
            return await _context.Empresas
                .Include(e=>e.Sucursales)
                .Include(e=>e.Propietario)
                .FirstOrDefaultAsync(e => e.Id == id);
        }
        public async Task<Empresa?> GetEmpresaByNombre(string nombre)
        {
            return await _context.Empresas
                .Include(e => e.Sucursales)
                .Include(e => e.Propietario)
                .FirstOrDefaultAsync(e => e.Nombre.ToLower() == nombre.ToLower());
        }
        public async Task<Empresa> AddEmpresa(Empresa empresa)
        {
            await _context.Empresas.AddAsync(empresa);
            await _context.SaveChangesAsync();
            return empresa;
        }
        public async Task UpdateEmpresa(Empresa empresa)
        {
            _context.Empresas.Update(empresa);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteEmpresa(Guid Id)
        {
            var empresa = new Empresa { Id = Id };  
            _context.Empresas.Attach(empresa);
            _context.Empresas.Remove(empresa);
            await _context.SaveChangesAsync();
        }
    }
}