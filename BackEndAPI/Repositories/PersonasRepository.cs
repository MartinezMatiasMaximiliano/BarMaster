using BackEndAPI.Data;
using BackEndAPI.Models;
using BackEndAPI.Repositories.Interfaces;
using BackEndAPI.Tenancy.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Repositories
{
    public class PersonasRepository : IPersonasRepository
    {
        private readonly ICurrentDbContext _context;
        private readonly AppDbContext db;
        public PersonasRepository(ICurrentDbContext context)
        {
            _context = context;
            db = context.Db;
        }

        public async Task<Persona?> GetPersonaPorId(Guid IdPersona)
        {
           return await db.Personas.FirstOrDefaultAsync(p => p.Id == IdPersona);
        }
        public async Task<Persona?> GetPersonaPorDni(string Dni)
        {
            return await db.Personas.FirstOrDefaultAsync(p => p.Dni == Dni);
        }
        public async Task<Persona?> CrearPersona(Persona nuevaPersona)
        {
            db.Personas.Add(nuevaPersona);
            await db.SaveChangesAsync();
            return nuevaPersona;
        }
        public async Task<Persona?> ActualizarPersona(Persona personaActualizada)
        {
            db.Entry(personaActualizada).State = EntityState.Modified;
            await db.SaveChangesAsync();
            return personaActualizada;
        }
        public async Task<Persona?> EliminarPersona(Guid IdPersona)
        {
            db.Personas.Remove(new Persona { Id = IdPersona });
            await db.SaveChangesAsync();
            return null;

        }
        public Task<List<Persona>> GetListaPersonasByEmpresaId(Guid IdEmpresa)
        {
            throw new NotImplementedException();
        }
        public async Task<bool> EsCodigoUnico(string codigoDeServicio)
        {
            return !await db.Personas.AnyAsync(p => p.CodigoDeServicio == codigoDeServicio);
        }
    }
}
