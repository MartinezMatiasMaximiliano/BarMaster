using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Models;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class EmpresasRepository : IEmpresasRepository
    {
        private readonly ICurrentDbContext _context;
        private readonly AppDbContext db;
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
                .Include(e => e.Sucursales)
                //.Include(e=>e.Propietario)
                .FirstOrDefaultAsync(e => e.Id == id);
        }
        public async Task<Empresa?> GetEmpresaByNombre(string nombre)
        {
            if (db == null) return null;

            return await db.Empresas
                .Include(e => e.Sucursales)
                //.Include(e => e.Propietario)
                .FirstOrDefaultAsync(e => e.Nombre.ToLower() == nombre.ToLower());
        }
        public async Task<Empresa> AddEmpresa(Empresa empresa, Tenant tenant)
        {
            try
            {
                await db.Empresas.AddAsync(empresa);
                await db.SaveChangesAsync();
                return empresa;
            }
            catch (Exception ex)
            {
                return null;
            }
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