using BackEndAPI.Data;
using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class EmpresasRepository : IEmpresasRepository
    {
        private readonly ICurrentDbContext _context;
        private readonly ApiDbContext db;
        public EmpresasRepository(ICurrentDbContext context)
        {
            _context = context;
            db = context.Db;
        }
        public async Task<IEnumerable<Empresa>> GetAllEmpresas()
        {
            return await db.Empresas
                .Include(e => e.Sucursales)
                //.Include(e => e.Propietario)
                .ToListAsync();
        }
        public async Task<Empresa?> GetEmpresaById(Guid id)
        {
            return await db.Empresas
                .Include(e=>e.Sucursales)
                //.Include(e=>e.Propietario)
                .FirstOrDefaultAsync(e => e.Id == id);
        }
        public async Task<Empresa?> GetEmpresaByNombre(string nombre)
        {
            return await db.Empresas
                .Include(e => e.Sucursales)
                //.Include(e => e.Propietario)
                .FirstOrDefaultAsync(e => e.Nombre.ToLower() == nombre.ToLower());
        }
        public async Task<Empresa> AddEmpresa(Empresa empresa)
        {
            await db.AddAsync(empresa);
            await db.SaveChangesAsync();
            return empresa;
        }
        public async Task UpdateEmpresa(Empresa empresa)
        {
            db.Empresas.Update(empresa);
            await db.SaveChangesAsync();
        }
        public async Task DeleteEmpresa(Guid Id)
        {
            var empresa = new Empresa { Id = Id };
            db.Empresas.Attach(empresa);
            db.Empresas.Remove(empresa);
            await db.SaveChangesAsync();
        }
    }
}